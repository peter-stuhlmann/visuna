// app/api/translate-field/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_MODELS } from '@/lib/ai/ai.config';
import { logAiUsage } from '@/lib/workspaces/ai-logs/logAiUsage';
import saveLog from '@/components/logs/saveLog';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TranslateFieldRequestBody = {
  /**
   * Flexibler Key, z.B. "title", "description", "content", "headline" etc.
   * Dieser Key wird im Response als oberste Ebene verwendet:
   *
   * {
   *   [key]: { de: "...", en: "...", ... }
   * }
   */
  key: string;
  /**
   * Der zu übersetzende Text (kann Plaintext oder einfaches HTML sein)
   */
  text: string;
  /**
   * Sprachcode der Ausgangssprache, z.B. "de", "en"
   */
  sourceLanguage: string;
  /**
   * Zielsprachen, z.B. ["de", "en", "es"]
   * Wenn leer/undefined, wird auf ["de"] gefallt.
   */
  targetLanguages?: string[];
  /**
   * Workspace-ID für AI-Logging
   */
  workspaceId?: string;
};

type TranslationsByLang = Record<string, string>;

type TranslateFieldResponse = {
  [key: string]: TranslationsByLang;
};

async function translateField(opts: {
  text: string;
  sourceLanguage: string;
  targetLanguages: string[];
}): Promise<{ translations: TranslationsByLang; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const { text, sourceLanguage, targetLanguages } = opts;

  const langs =
    Array.isArray(targetLanguages) && targetLanguages.length > 0
      ? targetLanguages
      : ['de'];

  const systemPrompt =
    'Du übersetzt Texte (auch mit einfachem HTML) von einer Ausgangssprache in mehrere Zielsprachen. ' +
    'Du antwortest ausschließlich als JSON-Objekt, ohne Erklärungstext. ' +
    'Wenn der Text HTML-Tags enthält, behalte die Struktur und Tags soweit wie möglich bei und übersetze nur den sichtbaren Text.';

  const userPrompt = `
Zu übersetzender Text (kann HTML enthalten):

${text}

Ausgangssprache: ${sourceLanguage}

Zielsprachen (Sprachcodes): ${langs.join(', ')}

Richtlinien:
- Übersetze in die jeweilige Zielsprache (de = Deutsch, en = Englisch, es = Spanisch, etc.).
- Behalte vorhandene HTML-Tags und Struktur so gut es geht bei.
- Übersetze keinen Code oder IDs, nur den sichtbaren Text.
- Kein zusätzlicher Kommentar, keine Erklärungen.

Antwortformat (exakt so, ohne Kommentare):

{
  "translations": {
    "de": "…",
    "en": "…",
    "es": "…"
  }
}
`.trim();

  const model = AI_MODELS.translation;
  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Keine Antwort vom OpenAI-Modell erhalten.');
  }

  let parsed: { translations?: TranslationsByLang };
  try {
    parsed = JSON.parse(rawContent) as { translations?: TranslationsByLang };
  } catch (err) {
    console.error('JSON-Parsing-Fehler bei OpenAI-Antwort:', err, rawContent);
    throw new Error('Antwort von OpenAI war kein valides JSON.');
  }

  const translations = parsed.translations ?? {};
  const result: TranslationsByLang = {};

  for (const lang of langs) {
    const value = translations[lang];
    if (typeof value === 'string' && value.trim()) {
      result[lang] = value.trim();
    }
  }

  const usage = completion.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  return { translations: result, usage };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateFieldRequestBody;

    const key = (body.key ?? '').trim();
    const text = (body.text ?? '').toString();
    const sourceLanguage = (body.sourceLanguage ?? '').trim();
    const workspaceId = (body.workspaceId ?? '').trim();
    const targetLanguages = (body.targetLanguages ?? [])
      .map((l) => l.trim())
      .filter(Boolean);

    if (!key) {
      return NextResponse.json(
        { error: 'Feld "key" ist erforderlich.' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Feld "text" ist erforderlich.' },
        { status: 400 }
      );
    }

    if (!sourceLanguage) {
      return NextResponse.json(
        { error: 'Feld "sourceLanguage" ist erforderlich.' },
        { status: 400 }
      );
    }

    const { translations, usage } = await translateField({
      text,
      sourceLanguage,
      targetLanguages,
    });

    // AI-Usage loggen
    if (workspaceId) {
      const targetLangsStr = targetLanguages.length > 0 ? targetLanguages.join(', ') : 'de';
      await logAiUsage({
        workspaceId,
        source: 'translation',
        userInput: text.length > 200 ? text.slice(0, 200) + '…' : text,
        action: `Übersetzung ${sourceLanguage.toUpperCase()} → ${targetLangsStr.toUpperCase()} (Feld: ${key})`,
        output: Object.entries(translations).map(([lang, t]) => `${lang}: ${typeof t === 'string' ? (t.length > 80 ? t.slice(0, 80) + '…' : t) : ''}`).join(' | '),
        model: AI_MODELS.translation,
        usage,
      });

      await saveLog({
        workspaceId,
        code: '2001',
        action: 'created',
        category: 'ai',
        entityType: 'translation',
        description: `AI-Übersetzung: ${sourceLanguage.toUpperCase()} → ${targetLangsStr.toUpperCase()} (Feld: ${key}).`,
        details: { sourceLanguage, targetLanguages, key },
      });
    }

    const responsePayload: TranslateFieldResponse = {
      [key]: translations,
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('Fehler in /api/ai/translate-field:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}

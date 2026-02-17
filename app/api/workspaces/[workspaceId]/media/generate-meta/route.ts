import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectToDatabase from '@/utils/connectToDatabase';
import saveLog from '@/components/logs/saveLog';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateMetaRequestBody = {
  publicIds?: string[];
  languages?: string[];
};

type MediaMetaDoc = {
  publicId: string;
  url: string;
  fileName?: string;
  workspaceId: string;
  meta?: {
    alt?: Record<string, string>;
    title?: Record<string, string>;
    caption?: Record<string, string>;
    copyright?: Record<string, string>;
  };
};

type SuggestedMeta = {
  publicId: string;
  alt: Record<string, string>;
  title: Record<string, string>;
  caption: Record<string, string>;
  copyright: Record<string, string>;
};

type GeneratedMetaResponse = {
  [lang: string]: {
    alt?: string;
    title?: string;
  };
};

async function generateMetaForOneImage(opts: {
  url: string;
  fileName: string;
  languages: string[];
}): Promise<{ alt: Record<string, string>; title: Record<string, string> }> {
  const { url, fileName, languages } = opts;

  const langs =
    Array.isArray(languages) && languages.length > 0 ? languages : ['de'];

  const systemPrompt =
    'Du siehst ein Bild und erzeugst aussagekräftige, aber knappe Bild-Titel ' +
    'und Alt-Texte (für Barrierefreiheit) in mehreren Sprachen. ' +
    'Antworte ausschließlich als JSON-Objekt, ohne Erklärungstext.';

  const userText = `
Du siehst gleich ein Bild.

Bild-URL: ${url}
Dateiname (falls hilfreich): ${fileName}

Erzeuge für folgende Sprachen einen passenden Titel und Alt-Text:
${langs.join(', ')}

Richtlinien:
- Der Titel ist kurz, aber aussagekräftig (max. ca. 80 Zeichen).
- Der Alt-Text beschreibt das Bild konkret und barrierefrei (max. ca. 160 Zeichen).
- Beschreibe nur, was tatsächlich auf dem Bild zu sehen ist.
- Wenn du Personen siehst, beschreibe neutral (z. B. "Porträt einer Person", "Person in Anzug"), 
  nenne nur dann Namen, wenn du dir sicher bist.
- Kein Marketing-Geschwafel, keine Hashtags.
- Schreibe in der jeweiligen Sprache (de = Deutsch, en = Englisch, es = Spanisch).

Antwortformat (exakt so, ohne Kommentare):

{
  "de": { "title": "…", "alt": "…" },
  "en": { "title": "…", "alt": "…" },
  "es": { "title": "…", "alt": "…" }
}
`.trim();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Updated to latest mini model if applicable, or generic
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userText,
          },
          {
            type: 'image_url',
            image_url: { url },
          },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Keine Antwort vom OpenAI-Modell erhalten.');
  }

  let parsed: GeneratedMetaResponse;
  try {
    parsed = JSON.parse(rawContent) as GeneratedMetaResponse;
  } catch (err) {
    console.error('JSON-Parsing-Fehler bei OpenAI-Antwort:', err, rawContent);
    throw new Error('Antwort von OpenAI war kein valides JSON.');
  }

  const alt: Record<string, string> = {};
  const title: Record<string, string> = {};

  for (const lang of langs) {
    const entry = parsed[lang];
    if (!entry) continue;

    if (entry.alt && entry.alt.trim()) {
      alt[lang] = entry.alt.trim();
    }
    if (entry.title && entry.title.trim()) {
      title[lang] = entry.title.trim();
    }
  }

  return { alt, title };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID missing' }, { status: 400 });
    }

    const body = (await req.json()) as GenerateMetaRequestBody;
    const publicIds = (body.publicIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);

    if (!publicIds.length) {
      return NextResponse.json(
        { error: 'Feld "publicIds" ist erforderlich.' },
        { status: 400 }
      );
    }

    const languages = (body.languages ?? ['de'])
      .map((l) => l.trim())
      .filter(Boolean);
    if (!languages.length) {
      languages.push('de');
    }

    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const collection = db.collection<MediaMetaDoc>('media');

    // Filter by workspaceId + publicIds
    const docs = (await collection
      .find({ 
        workspaceId,
        publicId: { $in: publicIds } 
      })
      .toArray()) as any[];

    const docsById = new Map<string, MediaMetaDoc>();
    docs.forEach((doc) => {
      docsById.set(doc.publicId, doc);
    });

    const suggestions: SuggestedMeta[] = [];

    for (const publicId of publicIds) {
      const doc = docsById.get(publicId);
      if (!doc || !doc.url) {
        // Either not found or belongs to another workspace (filtered out)
        continue;
      }

      const fileName = doc.fileName || publicId;

      let generated;
      try {
        generated = await generateMetaForOneImage({
          url: doc.url,
          fileName,
          languages,
        });
      } catch (err) {
        console.error(
          `[generate-meta] OpenAI-Fehler für publicId=${publicId}:`,
          err
        );
        continue;
      }

      const { alt, title } = generated;

      const caption: Record<string, string> = {};
      for (const lang of languages) {
        const t = title[lang];
        const a = alt[lang];
        if (t && t.trim()) {
          caption[lang] = t.trim();
        } else if (a && a.trim()) {
          caption[lang] = a.trim();
        }
      }

      const updateDoc: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      for (const [lang, value] of Object.entries(alt)) {
        updateDoc[`meta.alt.${lang}`] = value;
      }
      for (const [lang, value] of Object.entries(title)) {
        updateDoc[`meta.title.${lang}`] = value;
      }
      for (const [lang, value] of Object.entries(caption)) {
        updateDoc[`meta.caption.${lang}`] = value;
      }

      // Ensure we only update if workspaceId matches (redundant but safe)
      await collection.updateOne(
        { publicId, workspaceId },
        {
          $set: updateDoc,
          // We don't upsert here because if it doesn't exist in workspace context, 
          // we shouldn't create it blindly via meta generation. 
          // It should already exist via upload.
        }
      );

      suggestions.push({
        publicId,
        alt,
        title,
        caption,
        copyright: {}, 
      });
    }

    if (suggestions.length > 0) {
      await saveLog({
        workspaceId,
        code: '2002',
        action: 'created',
        category: 'ai',
        entityType: 'media_meta',
        description: `AI-Metadaten für ${suggestions.length} Bild(er) generiert.`,
        details: { count: suggestions.length, publicIds: suggestions.map(s => s.publicId) },
      });
    }

    return NextResponse.json(suggestions);
  } catch (err: any) {
    console.error('Fehler in generate-meta:', err);
    return NextResponse.json(
      { error: err.message || 'Interner Serverfehler', details: err.toString() },
      { status: 500 }
    );
  }
}

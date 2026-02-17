// app/api/workspaces/[workspaceId]/ai-chat/route.ts
//
// POST /api/workspaces/[id]/ai-chat
// Chatbot-Endpoint mit OpenAI Function Calling Loop.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AI_MODELS } from '@/lib/ai/ai.config';
import { logAiUsage } from '@/lib/workspaces/ai-logs/logAiUsage';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import { getSystemPrompt } from './systemPrompt';
import { toolDefinitions, executeToolCall, ToolResult } from './tools';
import saveLog from '@/components/logs/saveLog';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_TOOL_ROUNDS = 5; // max iterations of tool-calling

// ── Quick-Reply: Einfache Nachrichten ohne API-Call beantworten ──
// Performance: ~70 Regex-Checks auf max 40 Zeichen = Mikrosekunden.
// Ein OpenAI-Call kostet 1–5 Sekunden + ~1 Cent. Dieser Filter spart beides.

const QUICK_REPLIES: { pattern: RegExp; reply: string }[] = [

  // ── Grüße & Begrüßungen ──────────────────────────────────────
  { pattern: /^(hi|hey|hallo|moin|servus|na)$/i, reply: 'Hallo! 👋 Wie kann ich dir helfen? Du kannst mich z.B. bitten, eine Seite zu erstellen, Inhalte zu bearbeiten oder im Backend zu navigieren.' },
  { pattern: /^guten (tag|morgen|abend|mittag)$/i, reply: 'Hallo! 👋 Wie kann ich dir helfen?' },
  { pattern: /^(hallo bot|hi bot|hey bot|hey ai|hallo ai)$/i, reply: 'Hallo! 👋 Was kann ich für dich tun?' },
  { pattern: /^(hallöchen|hallihallo|grüße|grüezi|tach|moinsen|mahlzeit|grüß gott)$/i, reply: 'Hallo! 👋 Wie kann ich dir helfen?' },
  { pattern: /^(yo|yoo|sup|was geht|na du)$/i, reply: 'Hey! 👋 Was kann ich für dich tun?' },
  { pattern: /^(huhu|heyho|heyhey|hej|salut)$/i, reply: 'Hallo! 👋 Brauchst du Hilfe bei deinen Inhalten?' },

  // ── Danke & Lob ──────────────────────────────────────────────
  { pattern: /^(danke|dankeschön|vielen dank|besten dank|herzlichen dank)$/i, reply: 'Gerne! 😊 Brauchst du noch etwas anderes?' },
  { pattern: /^(thx|thanks|thank you|merci|gracias)$/i, reply: 'Gerne! 😊 Brauchst du noch etwas?' },
  { pattern: /^danke (dir|schön|sehr|vielmals)$/i, reply: 'Gerne! 😊 Kann ich sonst noch helfen?' },
  { pattern: /^(super|prima|perfekt|klasse|toll|genial|geil|hammer|stark|mega|nice|cool|awesome|great|spitze|wunderbar|fantastisch|grandios|hervorragend)$/i, reply: 'Freut mich! 😊 Brauchst du noch etwas anderes?' },
  { pattern: /^(top|sehr gut|sieht gut aus|passt perfekt|genau so|genau richtig)$/i, reply: 'Schön, dass es passt! 😊 Kann ich noch etwas tun?' },
  { pattern: /^das (ist|war) (super|toll|perfekt|klasse|gut|nice|mega)$/i, reply: 'Freut mich! 😊 Sag Bescheid wenn du noch etwas brauchst.' },
  { pattern: /^(gute arbeit|gut gemacht|well done|bravo|respekt)$/i, reply: 'Danke! 😊 Was kann ich noch für dich tun?' },
  { pattern: /^(läuft|sauber|passt schon|gefällt mir)$/i, reply: 'Freut mich! 😊 Brauchst du noch etwas?' },

  // ── Bestätigungen ────────────────────────────────────────────
  { pattern: /^(ok|okay|alles klar|verstanden|gut|passt|klar|roger|check|erledigt)$/i, reply: 'Alles klar! Sag Bescheid wenn du etwas brauchst. 👍' },
  { pattern: /^(jo|jop|jep|jup|yep|yeah|yup|jawohl|jepp|jaa+|ja)$/i, reply: 'Alles klar! 👍' },
  { pattern: /^(stimmt|genau|richtig|exakt|korrekt|wahr|recht hast du|absolut)$/i, reply: 'Alles klar! 👍 Kann ich sonst noch helfen?' },
  { pattern: /^(in ordnung|geht klar|mach ich|wird gemacht|einverstanden)$/i, reply: 'Super! 👍 Sag Bescheid wenn du Hilfe brauchst.' },
  { pattern: /^(hab ich|hab ich gesehen|hab ich gemacht|schon gemacht|schon erledigt)$/i, reply: 'Perfekt! 👍 Brauchst du noch etwas?' },
  { pattern: /^(bin fertig|fertig|geschafft|done)$/i, reply: 'Super! 🎉 Kann ich noch etwas für dich tun?' },

  // ── Ablehnungen ──────────────────────────────────────────────
  { pattern: /^(nein|nö|ne|nope|nix|nichts|nee|naa+)$/i, reply: 'Okay, kein Problem! Ich bin hier wenn du mich brauchst. 😊' },
  { pattern: /^(nein danke|ne danke|nö danke|kein bedarf|brauch ich nicht)$/i, reply: 'Alles klar! Meld dich wenn du was brauchst. 😊' },
  { pattern: /^(lass mal|lieber nicht|vielleicht später|später|nicht jetzt|erstmal nicht)$/i, reply: 'Okay, kein Stress! Ich bin da wenn du mich brauchst. 👍' },
  { pattern: /^(passt so|reicht|das war.?s|das reicht|genug|das wär.?s)$/i, reply: 'Alles klar, dann viel Erfolg! 😊' },
  { pattern: /^(im moment nicht|gerade nicht|jetzt nicht|nicht nötig)$/i, reply: 'Okay! Meld dich einfach wenn du Hilfe brauchst. 👍' },

  // ── Verabschiedung ───────────────────────────────────────────
  { pattern: /^(tschüss|bye|ciao|bis dann|auf wiedersehen|bis bald|bis später)$/i, reply: 'Tschüss! 👋 Bis zum nächsten Mal!' },
  { pattern: /^(gute nacht|schlaf gut|schönen abend|schönen tag|schönes wochenende)$/i, reply: 'Dir auch! 👋 Bis bald!' },
  { pattern: /^(mach.?s gut|hau rein|man sieht sich|bis denne|adieu|tschö)$/i, reply: 'Bis bald! 👋' },
  { pattern: /^(schönen feierabend|schönen tag noch|schöne woche)$/i, reply: 'Dir auch! 👋 Bis zum nächsten Mal!' },

  // ── Meta-Fragen über den Bot ─────────────────────────────────
  { pattern: /^(wer bist du|was bist du|was kannst du|hilfe|help)$/i, reply: 'Ich bin dein AI-Assistent für Visuna! Ich kann:\n• Seiten erstellen, bearbeiten und löschen\n• Elemente hinzufügen und konfigurieren\n• Templates verwalten\n• Im Backend navigieren\n• Bilder aus dem Medienpool einsetzen\n\nProbier es einfach aus! 🚀' },
  { pattern: /^(wie heißt du|hast du einen namen|dein name)$/i, reply: 'Ich bin der Visuna AI-Assistent! 🤖 Ich helfe dir beim Verwalten deiner Inhalte.' },
  { pattern: /^(wie funktionierst du|wie geht das)$/i, reply: 'Schreib mir einfach was du tun möchtest! Z.B. "Erstelle eine neue Seite" oder "Zeig mir alle Seiten". Ich erledige den Rest. 🚀' },
  { pattern: /^bist du (ein bot|eine ki|ein mensch|echt|real)$/i, reply: 'Ich bin ein AI-Assistent! 🤖 Spezialisiert auf dein CMS. Wie kann ich helfen?' },
  { pattern: /^(kannst du mir helfen|hilfst du mir|brauch hilfe|ich brauch hilfe)$/i, reply: 'Natürlich! 😊 Sag mir was du brauchst — Seiten, Elemente, Templates, Navigation?' },

  // ── Entschuldigung ───────────────────────────────────────────
  { pattern: /^(sorry|entschuldigung|tut mir leid|ups|oops|oh nein|mist)$/i, reply: 'Kein Problem! 😊 Was kann ich für dich tun?' },
  { pattern: /^(mein fehler|war ein versehen|falsch geklickt|verklickt)$/i, reply: 'Kein Ding! 😊 Wie kann ich helfen?' },

  // ── Smalltalk & Befinden ─────────────────────────────────────
  { pattern: /^wie geht.?s( dir)?$/i, reply: 'Mir geht es gut, danke! 😊 Wie kann ich dir helfen?' },
  { pattern: /^(alles gut|was machst du|und dir|und selbst)$/i, reply: 'Mir geht es gut! 😊 Wie kann ich dir helfen?' },
  { pattern: /^(geht so|naja|meh|könnte besser sein)$/i, reply: 'Vielleicht kann ich ja helfen! 😊 Was brauchst du?' },
  { pattern: /^(langweilig|mir ist langweilig|keine ahnung)$/i, reply: 'Wie wäre es mit einer neuen Seite? 😄 Sag mir einfach was du erstellen möchtest!' },
  { pattern: /^(guten hunger|prost|cheers)$/i, reply: 'Prost! 🍽️ Ich bin da wenn du mich brauchst.' },

  // ── Füllwörter & Unsinn ──────────────────────────────────────
  { pattern: /^(test|testing|teste|1234?|abcde?|asdf|qwert)$/i, reply: 'Ich bin bereit! Frag mich etwas zu deinen Seiten, Elementen oder Templates. 🚀' },
  { pattern: /^(hm+|hmm+|ähm+|öhm+|äh+|öh+)$/i, reply: 'Überleg in Ruhe! 😊 Ich bin hier wenn du bereit bist.' },
  { pattern: /^(ah+|oh+|oha|aha|ach so|aah|achso|aso)$/i, reply: 'Kann ich dir bei etwas helfen? 😊' },
  { pattern: /^(lol|haha|hihi|hehe|rofl|lmao|xd)$/i, reply: 'Ich bin bereit! Was kann ich für dich tun? 😄' },
  { pattern: /^(😂|🤣|😄|😆|😊|👍|❤️|🙂|🤔|🤷|🙏|👋|🎉|✨|🔥|💪|👌|✅|😎)$/, reply: 'Hey! 😊 Brauchst du Hilfe bei deinen Inhalten?' },
  { pattern: /^[\?\!\.]+$/, reply: 'Ich bin bereit! Frag mich etwas zu deinen Seiten, Elementen oder Templates. 🚀' },
  { pattern: /^(bla+h?|blub+|foo|bar|xyz|aaa+|zzz+)$/i, reply: 'Ich bin bereit! Wie kann ich dir helfen? 🚀' },
  { pattern: /^(egal|whatever|wayne|keine ahnung was)$/i, reply: 'Kein Problem! Schreib mir einfach wenn du etwas brauchst. 😊' },

  // ── Zeitüberbrückung ─────────────────────────────────────────
  { pattern: /^(moment( mal)?|warte( mal)?|sekunde|gleich|bin gleich da|eine sekunde)$/i, reply: 'Kein Stress, ich warte! ⏳' },
  { pattern: /^(ich bin (da|zurück|wieder da)|bin zurück|so)$/i, reply: 'Willkommen zurück! 😊 Was kann ich für dich tun?' },
  { pattern: /^(kurze frage|eine frage|mal eine frage|schnelle frage)$/i, reply: 'Klar, frag los! 😊' },
  { pattern: /^(ich hätte eine frage|darf ich fragen|eine sache noch)$/i, reply: 'Natürlich! Frag einfach! 😊' },
];

function getQuickReply(message: string): string | null {
  const trimmed = message.trim();
  // Nur kurze Nachrichten prüfen (max 40 Zeichen, kein mehrzeiliger Text)
  if (trimmed.length > 40 || trimmed.includes('\n')) return null;
  for (const { pattern, reply } of QUICK_REPLIES) {
    if (pattern.test(trimmed)) return reply;
  }
  return null;
}

type ChatRequest = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context?: {
    pageId?: string;
    editElementId?: string;
    mode?: string;
    templateId?: string;
    section?: string;
    templateType?: string;
  };
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Auth Check
    const { hasAccess, user } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as ChatRequest;
    const userMessages = body.messages ?? [];

    if (!userMessages.length) {
      return NextResponse.json({ error: 'Keine Nachricht.' }, { status: 400 });
    }

    // ── Pre-Filter: Einfache Nachrichten ohne API-Call beantworten ──
    const lastMsg = userMessages[userMessages.length - 1];
    const quickReply = getQuickReply(lastMsg?.content ?? '');
    if (quickReply) {
      // Logging trotzdem (aber mit 0 Tokens)
      await logAiUsage({
        workspaceId,
        userId: user?._id,
        source: 'chatbot',
        userInput: lastMsg.content,
        action: 'Nur Textantwort (Quick-Reply)',
        output: quickReply,
        model: 'quick-reply',
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
      return NextResponse.json({ reply: quickReply, actions: [] });
    }

    // Build message array
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: await getSystemPrompt(workspaceId) },
    ];

    // Kontext-Info einfügen (aktuelle Seite/Element/Template)
    if (body.context && Object.keys(body.context).length > 0) {
      const ctx = body.context;
      const parts: string[] = [];

      if (ctx.section) parts.push(`Bereich: ${ctx.section}`);
      if (ctx.pageId) parts.push(`Aktuelle Seite (pageId): ${ctx.pageId}`);
      if (ctx.editElementId) parts.push(`Gerade bearbeitetes Element (elementId): ${ctx.editElementId}`);
      if (ctx.mode) parts.push(`Modus: ${ctx.mode}`);
      if (ctx.templateId) parts.push(`Aktuelles Template (templateId): ${ctx.templateId}`);
      if (ctx.templateType) parts.push(`Template-Typ: ${ctx.templateType}`);

      messages.push({
        role: 'system',
        content: `[KONTEXT] Der User befindet sich aktuell hier:\n${parts.join('\n')}\nNutze diese IDs wenn der User sich auf "diese Seite", "dieses Element" oder "dieses Template" bezieht, ohne explizit eine ID zu nennen.`,
      });
    }

    messages.push(
      ...userMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    );

    const model = AI_MODELS.chatbot;
    const allActions: ToolResult[] = [];

    // Accumulate token usage across all rounds
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // ── Tool-Calling Loop ────────────────────────────────────
    let round = 0;
    while (round < MAX_TOOL_ROUNDS) {
      round++;

      const completion = await openai.chat.completions.create({
        model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
      });

      // Track token usage
      if (completion.usage) {
        totalInputTokens += completion.usage.prompt_tokens;
        totalOutputTokens += completion.usage.completion_tokens;
      }

      const choice = completion.choices[0];
      const msg = choice.message;

      // If no tool calls → final answer
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        const reply = msg.content ?? '';

        // Log the interaction
        const userInput = userMessages[userMessages.length - 1]?.content ?? '';
        const actionsSummary = allActions.length > 0
          ? allActions.map(a => a.name).join(', ')
          : 'Nur Textantwort';

        await logAiUsage({
          workspaceId,
          userId: user?._id,
          email: user?.email,
          source: 'chatbot',
          userInput: userInput.length > 200 ? userInput.slice(0, 200) + '…' : userInput,
          action: actionsSummary,
          output: reply.length > 300 ? reply.slice(0, 300) + '…' : reply,
          model,
          usage: {
            prompt_tokens: totalInputTokens,
            completion_tokens: totalOutputTokens,
            total_tokens: totalInputTokens + totalOutputTokens,
          },
        });

        await saveLog({
          workspaceId,
          code: '2003',
          action: 'created',
          category: 'ai',
          entityType: 'chat',
          description: `AI-Chat: ${actionsSummary}.`,
          details: { actions: allActions.map(a => a.name) },
        });

        return NextResponse.json({
          reply,
          actions: allActions,
        });
      }

      // ── Execute tool calls ──────────────────────────────────
      // Add assistant message with tool_calls to history
      messages.push(msg as ChatCompletionMessageParam);

      for (const toolCall of msg.tool_calls) {
        const tc = toolCall as any;
        const fnName = tc.function.name;
        let fnArgs: Record<string, any> = {};
        try {
          fnArgs = JSON.parse(tc.function.arguments || '{}');
        } catch {
          fnArgs = {};
        }

        const toolResult = await executeToolCall(fnName, fnArgs, workspaceId, user?._id);
        allActions.push(toolResult);

        // Add tool result to message history
        messages.push({
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: JSON.stringify(toolResult.result),
        });
      }
    }

    // If we hit MAX_TOOL_ROUNDS, return what we have
    return NextResponse.json({
      reply: 'Ich habe die maximale Anzahl an Aktionen erreicht. Bitte versuche es erneut.',
      actions: allActions,
    });
  } catch (err) {
    console.error('Fehler in POST /api/workspaces/[id]/ai-chat:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}

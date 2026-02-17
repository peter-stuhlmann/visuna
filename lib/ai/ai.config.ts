// lib/ai/ai.config.ts
// Globale AI-Konfiguration: Modelle, Preise, Defaults

/**
 * Welches Modell für welchen Zweck verwendet wird.
 * Hier zentral änderbar.
 */
export const AI_MODELS = {
  /** Für Feld-Übersetzungen (günstig, schnell, reicht für Übersetzungen) */
  translation: 'gpt-4.1-mini',
  /** Für den Chatbot mit Tool-Calling (braucht besseres Reasoning) */
  chatbot: 'gpt-4o',
} as const;

export type AiModelKey = keyof typeof AI_MODELS;
export type AiModelName = (typeof AI_MODELS)[AiModelKey];

/**
 * Preise pro 1M Tokens in USD.
 * Quelle: https://openai.com/api/pricing/
 * Stand: Februar 2025
 */
export const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  'gpt-4o':        { inputPer1M: 2.50,  outputPer1M: 10.00 },
  'gpt-4o-mini':   { inputPer1M: 0.15,  outputPer1M: 0.60  },
  'gpt-4.1':       { inputPer1M: 2.00,  outputPer1M: 8.00  },
  'gpt-4.1-mini':  { inputPer1M: 0.40,  outputPer1M: 1.60  },
  'gpt-4.1-nano':  { inputPer1M: 0.10,  outputPer1M: 0.40  },
};

/** Aktueller EUR/USD Wechselkurs (manuell pflegen oder API) */
export const EUR_USD_RATE = 0.92;

/**
 * Berechnet die Kosten einer AI-Anfrage in Euro-Cent.
 * @returns Kosten in Euro-Cent mit 5 Nachkommastellen
 */
export function calculateCostEurCent(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[AI Config] Kein Preis für Modell "${model}" hinterlegt, verwende 0.`);
    return 0;
  }

  const inputCostUsd = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCostUsd = (outputTokens / 1_000_000) * pricing.outputPer1M;
  const totalUsd = inputCostUsd + outputCostUsd;

  // USD → EUR → Cent
  const totalEurCent = totalUsd * EUR_USD_RATE * 100;

  return Math.round(totalEurCent * 100000) / 100000; // 5 Nachkommastellen
}

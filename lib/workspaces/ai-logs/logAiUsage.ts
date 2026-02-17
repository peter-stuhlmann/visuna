// lib/workspaces/ai-logs/logAiUsage.ts
//
// Zentrale Hilfsfunktion die von ALLEN AI-Endpoints aufgerufen wird.
// Berechnet die Kosten automatisch und speichert den Log.

import { createAiLog } from './aiLogs.service';
import { calculateCostEurCent } from '@/lib/ai/ai.config';

export type LogAiUsageParams = {
  workspaceId: string;
  userId?: string;
  email?: string;
  source: 'chatbot' | 'translation' | 'other';
  userInput: string;
  action: string;
  output: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/**
 * Loggt eine AI-Interaktion mit automatischer Kostenberechnung.
 * Aufrufen nach jedem OpenAI API-Call.
 */
export async function logAiUsage(params: LogAiUsageParams): Promise<void> {
  const { workspaceId, userId, email, source, userInput, action, output, model, usage } = params;

  const costEurCent = calculateCostEurCent(
    model,
    usage.prompt_tokens,
    usage.completion_tokens
  );

  try {
    await createAiLog(workspaceId, {
      userId,
      email,
      source,
      userInput,
      action,
      output,
      model,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      costEurCent,
    });
  } catch (err) {
    // Log-Fehler sollen die eigentliche AI-Funktion nicht blockieren
    console.error('[logAiUsage] Fehler beim Speichern des AI-Logs:', err);
  }
}

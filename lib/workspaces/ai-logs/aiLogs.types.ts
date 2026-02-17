// lib/workspaces/ai-logs/aiLogs.types.ts

export type AiLogDB = {
  _id: string;
  workspaceId: string;
  userId: string | null;
  email: string | null;
  /** Quelle der AI-Interaktion */
  source: 'chatbot' | 'translation' | 'other';
  /** Was der User eingegeben hat */
  userInput: string;
  /** Was das System gemacht hat (z.B. "Übersetzung DE→EN", "create_page aufgerufen") */
  action: string;
  /** Antwort an den User */
  output: string;
  /** Das verwendete Modell (z.B. 'gpt-4o', 'gpt-4.1-mini') */
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  /** Kosten in Euro-Cent mit 5 Nachkommastellen */
  costEurCent: number;
  createdAt: Date;
};

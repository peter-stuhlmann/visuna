// lib/workspaces/ai-logs/aiLogs.service.ts
import { insertAiLog, fetchAiLogs, fetchAiLogStats } from './aiLogs.repo';
import { AiLogDB } from './aiLogs.types';
import { createDbDocId } from '@/utils/createDbDocId';

type CreateAiLogInput = {
  userId?: string;
  email?: string;
  source: AiLogDB['source'];
  userInput: string;
  action: string;
  output: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costEurCent: number;
};

export async function getAiLogs(workspaceId: string, limit: number = 200) {
  return fetchAiLogs(workspaceId, limit);
}

export async function getAiLogStats(workspaceId: string) {
  return fetchAiLogStats(workspaceId);
}

export async function createAiLog(workspaceId: string, input: CreateAiLogInput): Promise<AiLogDB> {
  const log: AiLogDB = {
    _id: createDbDocId('ailog'),
    workspaceId,
    userId: input.userId ?? null,
    email: input.email ?? null,
    source: input.source,
    userInput: input.userInput,
    action: input.action,
    output: input.output,
    model: input.model,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    costEurCent: input.costEurCent,
    createdAt: new Date(),
  };

  await insertAiLog(log);
  return log;
}

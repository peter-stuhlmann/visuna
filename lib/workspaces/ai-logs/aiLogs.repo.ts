// lib/workspaces/ai-logs/aiLogs.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { AiLogDB } from './aiLogs.types';

const COLLECTION = 'aiLogs';

export async function fetchAiLogs(workspaceId: string, limit: number): Promise<AiLogDB[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const col = db.collection<AiLogDB>(COLLECTION);

  return col
    .find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function insertAiLog(log: AiLogDB): Promise<void> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const col = db.collection<AiLogDB>(COLLECTION);

  await col.insertOne(log);
}

export async function fetchAiLogStats(workspaceId: string): Promise<{
  totalTokens: number;
  totalCostEurCent: number;
  count: number;
}> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const col = db.collection<AiLogDB>(COLLECTION);

  const result = await col
    .aggregate([
      { $match: { workspaceId } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          totalCostEurCent: { $sum: '$costEurCent' },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  if (result.length === 0) {
    return { totalTokens: 0, totalCostEurCent: 0, count: 0 };
  }

  return {
    totalTokens: result[0].totalTokens,
    totalCostEurCent: Math.round(result[0].totalCostEurCent * 100000) / 100000,
    count: result[0].count,
  };
}

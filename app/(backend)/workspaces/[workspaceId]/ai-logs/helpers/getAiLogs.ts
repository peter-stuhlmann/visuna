import connectToDatabase from '@/utils/connectToDatabase';
import { AiLogDB } from '@/lib/workspaces/ai-logs/aiLogs.types';

export type AiLogFormatted = {
  source: string;
  userInput: string;
  action: string;
  output: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costEurCent: number;
  email: string | null;
  createdAt: string;
};

const getAiLogs = async (workspaceId: string): Promise<{
  logs: AiLogFormatted[];
  stats: { totalTokens: number; totalCostEurCent: number; count: number };
}> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const col = db.collection<AiLogDB>('aiLogs');

  try {
    const [logs, statsResult] = await Promise.all([
      col.find({ workspaceId }).sort({ createdAt: -1 }).limit(500).toArray(),
      col.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$totalTokens' },
            totalCostEurCent: { $sum: '$costEurCent' },
            count: { $sum: 1 },
          },
        },
      ]).toArray(),
    ]);

    const formattedLogs: AiLogFormatted[] = logs.map((log) => ({
      source: log.source,
      userInput: log.userInput,
      action: log.action,
      output: log.output,
      model: log.model,
      inputTokens: log.inputTokens,
      outputTokens: log.outputTokens,
      totalTokens: log.totalTokens,
      costEurCent: log.costEurCent,
      email: log.email,
      createdAt: log.createdAt?.toISOString?.() ?? new Date().toISOString(),
    }));

    const stats = statsResult.length > 0
      ? {
          totalTokens: statsResult[0].totalTokens,
          totalCostEurCent: Math.round(statsResult[0].totalCostEurCent * 100000) / 100000,
          count: statsResult[0].count,
        }
      : { totalTokens: 0, totalCostEurCent: 0, count: 0 };

    return { logs: formattedLogs, stats };
  } catch (error) {
    console.error('Error fetching AI logs:', error);
    return { logs: [], stats: { totalTokens: 0, totalCostEurCent: 0, count: 0 } };
  }
};

export default getAiLogs;

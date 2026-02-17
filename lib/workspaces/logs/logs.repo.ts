// lib/workspaces/logs/logs.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { LogDB } from './logs.types';

const COLLECTION = 'activityLogs';

export async function fetchLogs(workspaceId: string, limit: number) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const logs = db.collection<LogDB>(COLLECTION);

  return logs
    .find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function fetchLogById(
  workspaceId: string,
  logId: string
): Promise<LogDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const logs = db.collection<LogDB>(COLLECTION);

  return logs.findOne({
    _id: logId,
    workspaceId,
  });
}

export async function insertLog(log: LogDB) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const logs = db.collection<LogDB>(COLLECTION);

  await logs.insertOne(log);
}

export async function deleteLogs(
  workspaceId: string,
  logIds: string[]
): Promise<number> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const logs = db.collection<LogDB>(COLLECTION);

  const result = await logs.deleteMany({
    _id: { $in: logIds },
    workspaceId,
  });

  return result.deletedCount;
}

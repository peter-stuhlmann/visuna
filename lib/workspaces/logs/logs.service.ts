// lib/workspaces/logs/logs.service.ts
import { insertLog, fetchLogs, fetchLogById } from './logs.repo';
import { LogDB, LogAction, LogCategory, LogVisibility } from './logs.types';
import { createDbDocId } from '@/utils/createDbDocId';

export type CreateLogInput = {
  workspaceId: string;
  code: string;
  action: LogAction;
  category: LogCategory;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  description: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  details?: Record<string, unknown> | null;
  visibility?: LogVisibility;
};

export async function getLogs(workspaceId: string, limit: number) {
  return fetchLogs(workspaceId, limit);
}

export async function createLog(input: CreateLogInput) {
  const {
    workspaceId,
    code,
    action,
    category,
    entityType,
    entityId,
    entityName,
    description,
    userId,
    userEmail,
    userName,
    details,
  } = input;

  if (!description) {
    throwValidation('Description ist erforderlich.');
  }

  const log: LogDB = {
    _id: createDbDocId('log'),
    publicId: generatePublicId(),
    workspaceId,
    code,
    action,
    category,
    entityType,
    entityId: entityId ?? null,
    entityName: entityName ?? null,
    description,
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    userName: userName ?? null,
    details: details ?? null,
    visibility: input.visibility ?? 'all',
    createdAt: new Date(),
  };

  await insertLog(log);
  return log;
}

export async function getLogById(workspaceId: string, logId: string) {
  return fetchLogById(workspaceId, logId);
}

function throwValidation(msg: string) {
  const err = new Error('VALIDATION_ERROR');
  (err as any).details = msg;
  throw err;
}

/** Generate a short, human-readable public ID like LOG-A1B2C3D4 */
function generatePublicId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LOG-${id}`;
}

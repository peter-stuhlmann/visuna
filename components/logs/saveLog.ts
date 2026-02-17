// components/logs/saveLog.ts
//
// Server-side activity logger.
// Writes directly to the DB via logs.service — no self-fetch.
// Automatically resolves the current user from the server session.

import { getServerSession } from 'next-auth';
import { createLog, CreateLogInput } from '@/lib/workspaces/logs/logs.service';
import type { LogAction, LogCategory } from '@/lib/workspaces/logs/logs.types';
import connectToDatabase from '@/utils/connectToDatabase';

export type SaveLogInput = {
  workspaceId: string;
  /** 4-digit log code, e.g. "1001" */
  code: string;
  action: LogAction;
  category: LogCategory;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  description: string;
  details?: Record<string, unknown>;
  /** Visibility: 'all' (default) or 'superadmin' */
  visibility?: 'all' | 'superadmin';
};

/**
 * Log an activity to the workspace activity log.
 *
 * Resolves the current user automatically from the server session
 * and looks up the MongoDB userId by email.
 * Never throws — errors are caught and logged to the console.
 */
const saveLog = async (input: SaveLogInput): Promise<void> => {
  try {
    // Resolve user from session + DB lookup
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    try {
      const session = await getServerSession();
      if (session?.user?.email) {
        userEmail = session.user.email;
        userName = session.user.name ?? null;

        // Look up userId from DB by email (same pattern as getLoggedInUser)
        try {
          const { db } = await connectToDatabase(process.env.DB_NAME as string);
          const userDoc = await db
            .collection('users')
            .findOne({ email: userEmail });

          if (userDoc?._id) {
            userId = userDoc._id.toString();
          }

          // Use DB name if available (may be more up-to-date than session)
          if (userDoc && typeof (userDoc as any).name === 'string') {
            userName = (userDoc as any).name;
          }
        } catch {
          // DB lookup failed — continue with session data only
        }
      }
    } catch {
      // Session resolution failed — continue without user info
    }

    const logInput: CreateLogInput = {
      workspaceId: input.workspaceId,
      code: input.code,
      action: input.action,
      category: input.category,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityName: input.entityName ?? null,
      description: input.description,
      userId,
      userEmail,
      userName,
      details: input.details ?? null,
      visibility: input.visibility,
    };

    await createLog(logInput);
  } catch (error) {
    console.error('Fehler beim Speichern des Logs:', error);
  }
};

export default saveLog;

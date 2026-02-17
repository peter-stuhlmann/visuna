// lib/workspaces/logs/logs.types.ts

export type LogAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'duplicated'
  | 'status_changed'
  | 'published'
  | 'unpublished'
  | 'invited'
  | 'revoked'
  | 'role_changed'
  | 'login'
  | 'logout';

export type LogCategory =
  | 'page'
  | 'template'
  | 'page_element'
  | 'seo'
  | 'media'
  | 'user'
  | 'workspace'
  | 'invitation'
  | 'language'
  | 'ai'
  | 'auth';

/**
 * Visibility level for log entries.
 * - 'all'        — visible to admin + superadmin (default)
 * - 'superadmin' — visible to superadmin only
 */
export type LogVisibility = 'all' | 'superadmin';

export type LogDB = {
  _id: string;
  /** Short human-readable ID, e.g. "LOG-A1B2C3" */
  publicId: string;
  workspaceId: string;

  /** 4-digit log code (e.g. "1001") */
  code: string;

  /** Structured action type */
  action: LogAction;
  /** High-level category */
  category: LogCategory;

  /** What kind of entity was affected */
  entityType: string;
  /** ID of the affected entity */
  entityId?: string | null;
  /** Human-readable name of the affected entity */
  entityName?: string | null;

  /** Human-readable summary */
  description: string;

  /** User who performed the action */
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;

  /** Extra structured data */
  details?: Record<string, unknown> | null;

  /** Visibility level (default: 'all') */
  visibility?: LogVisibility;

  createdAt: Date;

  // --- legacy fields (old logs may still have these) ---
  /** @deprecated Use `description` instead */
  activity?: string;
  /** @deprecated Use `userEmail` instead */
  email?: string;
};

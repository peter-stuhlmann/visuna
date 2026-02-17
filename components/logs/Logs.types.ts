// components/logs/Logs.types.ts

export type Log = {
  _id?: string;
  publicId?: string;
  /** 4-digit log code */
  code?: string;
  /** Human-readable description */
  description?: string;
  /** Category (page, template, media, ai, …) */
  category?: string;
  /** User who performed the action */
  userName?: string;
  userEmail?: string;
  /** Timestamp */
  createdAt?: string;
  /** Detailed change information */
  details?: {
    changes?: { field: string; from: string; to: string }[];
    [key: string]: any;
  } | null;

  // --- legacy fields (old log entries) ---
  /** @deprecated Use `description` */
  activity?: string;
  /** @deprecated Use `userEmail` */
  email?: string;
  /** @deprecated Use `createdAt` */
  timestamp?: string;
};

export type LogsProps = {
  logs: Log[] | null;
  userRole?: string;
  workspaceId: string;
};

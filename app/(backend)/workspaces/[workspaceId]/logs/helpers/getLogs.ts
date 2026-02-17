import { Log } from '@/components/logs/Logs.types';
import connectToDatabase from '@/utils/connectToDatabase';

/** Admins see 90 days, SuperAdmins see 365 days */
const RETENTION_DAYS_ADMIN = 90;
const RETENTION_DAYS_SUPERADMIN = 365;

const getLogs = async (
  workspaceId?: string,
  userRole?: string
): Promise<Log[] | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection('activityLogs');

  try {
    const filter: Record<string, unknown> = {};
    if (workspaceId) filter.workspaceId = workspaceId;

    // Non-superadmins only see logs with visibility 'all' (or no visibility set)
    if (userRole !== 'superadmin') {
      filter.$or = [
        { visibility: { $exists: false } },
        { visibility: 'all' },
      ];
    }

    // Date-based retention: admins see 90 days, superadmins see 365 days
    const retentionDays =
      userRole === 'superadmin' ? RETENTION_DAYS_SUPERADMIN : RETENTION_DAYS_ADMIN;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    filter.createdAt = { $gte: cutoff };

    const logs = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    if (logs.length === 0) return null;

    return logs.map((doc) => ({
      _id: doc._id?.toString(),
      publicId: doc.publicId,
      // New fields
      code: doc.code,
      action: doc.action,
      category: doc.category,
      entityType: doc.entityType,
      entityId: doc.entityId,
      entityName: doc.entityName,
      description: doc.description ?? doc.activity,
      userId: doc.userId,
      userEmail: doc.userEmail ?? doc.email,
      userName: doc.userName,
      details: doc.details,
      visibility: doc.visibility,
      createdAt: doc.createdAt ?? doc.timestamp,
      // Legacy fallback
      email: doc.email ?? doc.userEmail,
      activity: doc.activity ?? doc.description,
      timestamp: doc.timestamp ?? doc.createdAt?.toISOString?.() ?? undefined,
    })) as Log[];
  } catch (error) {
    console.error('Error fetching logs:', error);
    return null;
  }
};

export default getLogs;

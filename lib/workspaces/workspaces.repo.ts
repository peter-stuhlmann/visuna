// lib/workspaces/workspaces.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { Workspace, WorkspaceDB } from './workspaces.types';
import { createDbDocId } from '@/utils/createDbDocId';
import { User } from '../users/users.types';

/* ---------- TYPES ---------- */

export type WorkspaceAccessItem = {
  userId: string;
  role: string;
};

export type UserDoc = {
  _id: string;
  email?: string;
  workspaces: string[];
  currentWorkspaceId?: string;
};

/* ---------- FIND ---------- */

export async function findWorkspaceByDomain(domain: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  return db.collection<WorkspaceDB>('workspaces').findOne({ domain });
}

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const doc = await db
    .collection<WorkspaceDB>('workspaces')
    .findOne({ _id: workspaceId });

  if (!doc) return null;

  return doc;
}

export async function fetchWorkspacesForUser(
  userId: string
): Promise<Workspace[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  return db
    .collection<WorkspaceDB>('workspaces')
    .find({ 'access.userId': userId })
    .toArray();
}

/* ---------- CREATE WORKSPACE ---------- */

export async function insertWorkspace(doc: Omit<Workspace, '_id'>) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const _id = createDbDocId('ws'); // string id

  await db.collection<Workspace>('workspaces').insertOne({
    ...doc,
    _id,
  });

  return { ...doc, _id };
}



export async function addWorkspaceToUsers(
  workspaceId: string,
  userIds: string[]
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db.collection<User>('users').updateMany(
    { _id: { $in: userIds } },
    {
      $addToSet: { workspaces: workspaceId },
    }
  );
}

/* ---------- UPDATE ---------- */

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Pick<Workspace, 'name' | 'domain' | 'thumbnail'>>
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db
    .collection<Workspace>('workspaces')
    .updateOne({ _id: workspaceId }, { $set: data });

  return getWorkspaceById(workspaceId);
}

/* ---------- REVOKE ACCESS ---------- */

export async function removeAccessFromWorkspace(
  workspaceId: string,
  userId: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db.collection<Workspace>('workspaces').updateOne(
    { _id: workspaceId },
    {
      $pull: {
        access: { userId },
      },
    }
  );
}

export async function countUserWorkspaces(userId: string): Promise<number> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  return db.collection<Workspace>('workspaces').countDocuments({
    'access.userId': userId,
  });
}

export async function getWorkspaceUsers(
  workspaceId: string
): Promise<string[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const workspace = await db
    .collection<Workspace>('workspaces')
    .findOne({ _id: workspaceId });

  if (!workspace || !Array.isArray(workspace.access)) return [];

  return workspace.access.map((a) => a.userId);
}

export async function deleteWorkspaceById(workspaceId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  return db.collection<Workspace>('workspaces').deleteOne({ _id: workspaceId });
}

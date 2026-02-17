// lib/invitations/invitations.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceAccess, WorkspaceDB } from '../workspaces/workspaces.types';
import type { RoleKey } from '@/lib/roles/roles';
import type { InvitationDB } from './invitations.types';

/* ---------- Workspace helpers (kept for legacy/service use) ---------- */

export async function getWorkspaceById(id: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db.collection<WorkspaceDB>('workspaces').findOne({ _id: id });
}

export async function isUserInWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const workspace = await db
    .collection<WorkspaceDB>('workspaces')
    .findOne({ _id: workspaceId });

  return (
    workspace?.access?.some((a: WorkspaceAccess) => a.userId === userId) ??
    false
  );
}

export async function addUserToWorkspace(
  workspaceId: string,
  userId: string,
  role: RoleKey
) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  await db.collection<WorkspaceDB>('workspaces').updateOne(
    { _id: workspaceId },
    {
      $addToSet: {
        access: { userId, role },
      },
    }
  );
}

/* ---------- Invitations collection ---------- */

export async function insertInvitation(inv: InvitationDB) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  await db.collection<InvitationDB>('invitations').insertOne(inv);
}

export async function findInvitationByToken(
  token: string
): Promise<InvitationDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db.collection<InvitationDB>('invitations').findOne({ token });
}

export async function findInvitationById(
  id: string
): Promise<InvitationDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db.collection<InvitationDB>('invitations').findOne({ _id: id });
}

export async function updateInvitationStatus(
  id: string,
  status: InvitationDB['status'],
  respondedAt: Date = new Date()
) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  await db
    .collection<InvitationDB>('invitations')
    .updateOne({ _id: id }, { $set: { status, respondedAt } });
}

export async function updateInvitationToken(id: string, token: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  await db
    .collection<InvitationDB>('invitations')
    .updateOne(
      { _id: id },
      { $set: { token, status: 'pending' as const, respondedAt: undefined } }
    );
}

export async function deleteInvitationById(id: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  await db.collection<InvitationDB>('invitations').deleteOne({ _id: id });
}

export async function findInvitationsByWorkspace(
  workspaceId: string
): Promise<InvitationDB[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db
    .collection<InvitationDB>('invitations')
    .find({ workspaceId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findPendingInvitationByEmail(
  email: string,
  workspaceId: string
): Promise<InvitationDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db.collection<InvitationDB>('invitations').findOne({
    email: { $regex: `^${email}$`, $options: 'i' },
    workspaceId,
    status: 'pending',
  });
}

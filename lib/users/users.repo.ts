// lib/users/users.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { UserDB } from './users.types';

/* ---------- USERS ---------- */

export async function findUserByEmail(email: string): Promise<UserDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const users = db.collection<UserDB>('users');

  return users.findOne({
    email: { $regex: `^${email}$`, $options: 'i' },
  });
}

import { createDbDocId } from '@/utils/createDbDocId';

export async function createUser(data: Partial<UserDB>): Promise<UserDB> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const users = db.collection<UserDB>('users');

  const _id = createDbDocId('user');

  const user: UserDB = {
    ...data,
    _id,
    createdAt: new Date(),
    passwordUpdatedAt: new Date(),
    workspaces: [],
  } as UserDB;

  await users.insertOne(user);
  return user;
}

export async function createInvitedUser(email: string, workspaceId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const users = db.collection<UserDB>('users');

  const _id = createDbDocId('user');

  const user: UserDB = {
    _id,
    email,
    verified: false,
    currentWorkspaceId: workspaceId,
    createdAt: new Date(),
    workspaces: [workspaceId],
  } as UserDB;

  await users.insertOne(user);
  return { ...user };
}

export async function addWorkspaceToUser(userId: string, workspaceId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const users = db.collection<UserDB>('users');

  await users.updateOne(
    { _id: userId },
    {
      $addToSet: { workspaces: workspaceId },
      $set: { currentWorkspaceId: workspaceId },
    }
  );
}

export async function removeWorkspaceFromUser(
  userId: string,
  workspaceId: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db.collection<UserDB>('users').updateOne(
    { _id: userId },
    {
      $pull: { workspaces: workspaceId },
      $set: { currentWorkspaceId: null },
    }
  );
}

export async function updateUserById(
  userId: string,
  updateData: Partial<UserDB>
): Promise<UserDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const users = db.collection<UserDB>('users');

  const result = await users.updateOne({ _id: userId }, { $set: updateData });

  if (result.matchedCount === 0) {
    return null;
  }

  return users.findOne({ _id: userId });
}

export async function deleteUser(userId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  await db.collection<UserDB>('users').deleteOne({ _id: userId });
}

export async function getUsersByIds(userIds: string[]) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  return db
    .collection<UserDB>('users')
    .find({ _id: { $in: userIds } })
    .toArray();
}

export async function deleteUserById(userId: string): Promise<UserDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const usersCollection = db.collection<UserDB>('users');

  const user = await usersCollection.findOne({ _id: userId });
  if (!user) return null;

  await usersCollection.deleteOne({ _id: userId });
  return user;
}

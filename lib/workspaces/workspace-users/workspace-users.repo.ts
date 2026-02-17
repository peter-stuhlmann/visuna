// lib/workspaces/workspace-users.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '../workspaces.types';

export async function getWorkspaceById(id: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  return db.collection<WorkspaceDB>('workspaces').findOne({
    _id: id,
  });
}

export async function removeUserFromWorkspace(
  workspaceId: string,
  userId: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const workspaces = db.collection<WorkspaceDB>('workspaces');

  await workspaces.updateOne(
    { _id: workspaceId },
    {
      $pull: {
        access: { userId },
      },
    }
  );
}

export async function countUserWorkspaces(userId: string): Promise<number> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  return db.collection('workspaces').countDocuments({
    'access.userId': userId,
  });
}

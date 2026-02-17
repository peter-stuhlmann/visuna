import { User } from '@/lib/users/users.types';
import {
  WorkspaceDB,
  WorkspaceListItem,
} from '@/lib/workspaces/workspaces.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { getServerSession } from 'next-auth';

export const getWorkspaces = async (): Promise<WorkspaceListItem[] | null> => {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const usersCollection = db.collection<User>('users');
  const user = await usersCollection.findOne({ email: session.user.email });
  if (!user) return null;

  const workspacesCollection = db.collection<WorkspaceDB>('workspaces');

  const fetchedWorkspaces = await workspacesCollection
    .find({ 'access.userId': user._id })
    .toArray();

  console.log(fetchedWorkspaces);
  if (!fetchedWorkspaces.length) return null;

  return fetchedWorkspaces.map((ws) => ({
    _id: ws._id,
    name: ws.name,
    thumbnail: ws.thumbnail ?? '',
    domain: ws.domain ?? '',
    access:
      ws.access?.map((a) => ({
        userId: a.userId,
        role: a.role,
      })) ?? [],
  }));
};

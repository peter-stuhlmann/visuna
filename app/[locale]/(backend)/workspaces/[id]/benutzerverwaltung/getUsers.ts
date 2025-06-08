import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { User, WorkspaceDb } from '@/types';

export const getUsers = async (): Promise<User[] | null> => {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
    console.error('No logged in user found');
    return null;
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const usersCollection = db.collection<User>('users');
  const workspacesCollection = db.collection<WorkspaceDb>('workspaces');

  try {
    const workspaceId = loggedInUser.currentWorkspaceId;
    if (!workspaceId) {
      console.error('User has no currentWorkspaceId');
      return null;
    }

    const workspaceData = await workspacesCollection.findOne({
      _id: new ObjectId(workspaceId),
    });

    if (
      !workspaceData ||
      !workspaceData.access ||
      !Array.isArray(workspaceData.access)
    ) {
      console.error('No workspace or access list found');
      return null;
    }

    const accessMap = new Map(
      workspaceData.access.map((entry) => [entry.userId.toString(), entry.role])
    );

    const users = await usersCollection
      .find({
        _id: {
          $in: workspaceData.access.map((entry) => new ObjectId(entry.userId)),
        },
      })
      .toArray();

    const usersWithAccess = users.map((user) => {
      const userIdStr = user._id.toString();
      const role = accessMap.get(userIdStr);

      return {
        _id: user._id,
        email: user.email,
        currentWorkspaceId: workspaceId,
        workspaces: user.workspaces,
        currentWorkspaceRole: role || 'Unbekannt',
        createdAt: user.createdAt,
        verified: user.verified,
      };
    });

    return usersWithAccess;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

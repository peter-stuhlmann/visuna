import connectToDatabase from '@/utils/connectToDatabase';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { User } from '@/lib/users/users.types';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';

export const getUsers = async (): Promise<User[] | null> => {
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) {
    console.error('No logged in user found');
    return null;
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const usersCollection = db.collection<User>('users');
  const workspacesCollection = db.collection<WorkspaceDB>('workspaces');

  try {
    const workspaceId = loggedInUser.currentWorkspaceId;
    if (!workspaceId) {
      console.error('User has no currentWorkspaceId');
      return null;
    }

    const workspaceData = await workspacesCollection.findOne({
      _id: workspaceId,
    });

    if (
      !workspaceData ||
      !workspaceData.access ||
      !Array.isArray(workspaceData.access)
    ) {
      console.error('No workspace or access list found');
      return null;
    }

    // Filter out superadmin entries — they have universal access
    // and should not be shown in the workspace user list
    const visibleAccess = workspaceData.access.filter(
      (entry) => entry.role !== 'superadmin'
    );

    const accessMap = new Map(
      visibleAccess.map((entry) => [entry.userId.toString(), entry.role])
    );

    const users = await usersCollection
      .find({
        _id: {
          $in: visibleAccess.map((entry) => entry.userId),
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
        name: user.name,
      };
    });

    return usersWithAccess;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

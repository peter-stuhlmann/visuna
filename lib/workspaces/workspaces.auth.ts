import { getServerSession } from 'next-auth';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { getWorkspaceById } from '@/lib/workspaces/workspaces.repo';
import { User } from '@/lib/users/users.types';
import { Workspace } from '@/lib/workspaces/workspaces.types';
import connectToDatabase from '@/utils/connectToDatabase';

export type WorkspaceAccessResult = {
  hasAccess: boolean;
  role: 'superadmin' | 'admin' | 'editor' | 'read-only' | 'none';
  workspace: Workspace | null;
  user: User | null;
};

export async function checkWorkspaceAccess(
  workspaceId: string
): Promise<WorkspaceAccessResult> {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return { hasAccess: false, role: 'none', workspace: null, user: null };
  }

  const user = await getLoggedInUser();

  if (!user) {
    return { hasAccess: false, role: 'none', workspace: null, user: null };
  }

  const workspace = await getWorkspaceById(workspaceId);

  if (!workspace) {
    return { hasAccess: false, role: 'none', workspace: null, user };
  }

  // Check direct access in this workspace
  const accessEntry = workspace.access.find(
    (a) => a.userId === user._id
  );

  if (accessEntry) {
    return {
      hasAccess: true,
      role: (accessEntry.role as WorkspaceAccessResult['role']) || 'none',
      workspace,
      user,
    };
  }

  // No direct access — check if user is a SuperAdmin in ANY workspace
  const isSuperAdmin = await isUserSuperAdmin(user._id);

  if (isSuperAdmin) {
    return {
      hasAccess: true,
      role: 'superadmin',
      workspace,
      user,
    };
  }

  return { hasAccess: false, role: 'none', workspace, user };
}

/**
 * Check if a user holds the 'superadmin' role in at least one workspace.
 */
async function isUserSuperAdmin(userId: string): Promise<boolean> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const workspaces = db.collection('workspaces');

  const match = await workspaces.findOne({
    access: { $elemMatch: { userId, role: 'superadmin' } },
  });

  return !!match;
}

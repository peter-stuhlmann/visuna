// utils/getLoggedInUser.ts
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';
import { User } from '@/lib/users/users.types';

type ProfileData = {
  name: string;
  email: string;
  avatarUrl: string;
  birthday: string;
  slogan: string;
};

type WorkspaceAccess = {
  userId: string;
  role: string;
};

type WorkspaceProfileData = {
  displayName: string;
  avatarUrl: string;
  role: string;
};

export type LoggedInUserWithProfile = User & {
  profile: ProfileData;
  workspaceProfile: WorkspaceProfileData;
};

function coerceString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'toString' in v) return v.toString();
  return '';
}

export const getLoggedInUser =
  async (): Promise<LoggedInUserWithProfile | null> => {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) return null;

    const { db } = await connectToDatabase(process.env.DB_NAME as string);

    // User aus DB (IDs sind Strings)
    const userData = await db
      .collection('users')
      .findOne({ email: session.user.email });

    if (!userData) return null;

    const userId = coerceString(userData._id);
    const currentWorkspaceId = coerceString(userData.currentWorkspaceId);

    // Defaults
    let currentWorkspaceRole: string = 'none';
    const workspaceProfile: WorkspaceProfileData = {
      displayName: '',
      avatarUrl: '',
      role: '',
    };

    // Workspace laden (string ID)
    if (currentWorkspaceId) {
      const workspaceData = await db
        .collection<WorkspaceDB>('workspaces')
        .findOne({ _id: currentWorkspaceId });

      if (workspaceData && Array.isArray((workspaceData as any).access)) {
        const accessEntry = (workspaceData as any).access.find(
          (entry: WorkspaceAccess) => String(entry.userId) === String(userId)
        ) as
          | (WorkspaceAccess & {
              displayName?: unknown;
              avatarUrl?: unknown;
            })
          | undefined;

        if (accessEntry) {
          currentWorkspaceRole = coerceString(accessEntry.role) || 'none';

          workspaceProfile.displayName = coerceString(
            (accessEntry as any).displayName
          );
          workspaceProfile.avatarUrl = coerceString(
            (accessEntry as any).avatarUrl
          );
          workspaceProfile.role = currentWorkspaceRole;
        } else {
          workspaceProfile.role = currentWorkspaceRole;
        }
      } else {
        workspaceProfile.role = currentWorkspaceRole;
      }
    } else {
      workspaceProfile.role = currentWorkspaceRole;
    }

    // Globales Profil
    const profile: ProfileData = {
      name: coerceString((userData as any).name),
      email: coerceString(userData.email),
      avatarUrl: coerceString((userData as any).avatarUrl),
      birthday: coerceString((userData as any).birthday),
      slogan: coerceString((userData as any).slogan),
    };

    // Fallback aus Session
    if (!profile.name) {
      profile.name = coerceString((session.user as any)?.name);
    }

    const loggedInUser: LoggedInUserWithProfile = {
      _id: userId,
      email: profile.email,
      workspaces: (userData as any).workspaces,
      currentWorkspaceId,
      profile,
      workspaceProfile,
      name: profile.name,
      preferences: (userData as any).preferences,
    };

    return loggedInUser;
  };

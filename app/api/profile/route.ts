import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';
import { UserDB } from '@/lib/users/users.types';
import { updateUserById } from '@/lib/users/users.repo';

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */
const coerceString = (v: unknown): string => (typeof v === 'string' ? v : '');

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);
    const user = await db.collection<UserDB>('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const profile = {
      name: coerceString(user.name),
      email: coerceString(user.email),
      avatarUrl: coerceString(user.avatarUrl),
      birthday: coerceString(user.birthday),
      slogan: coerceString(user.slogan),
    };

    let workspaceProfile = {
      displayName: '',
      avatarUrl: '',
      role: '',
    };

    if (user.currentWorkspaceId) {
      const workspace = await db.collection<WorkspaceDB>('workspaces').findOne({ _id: user.currentWorkspaceId });
      if (workspace) {
        const access = workspace.access.find((a) => String(a.userId) === String(user._id));
        if (access) {
          workspaceProfile = {
            displayName: coerceString(access.displayName),
            avatarUrl: coerceString(access.avatarUrl),
            role: coerceString(access.role),
          };
        }
      }
    }

    return NextResponse.json({ profile, workspaceProfile });

  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*                                    PATCH                                   */
/* -------------------------------------------------------------------------- */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { profile, workspaceProfile } = await req.json();
    const { db } = await connectToDatabase(process.env.DB_NAME!);
    
    // 1. Get User
    const user = await db.collection<UserDB>('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Update Global Profile
    const updateData: Partial<UserDB> = {};
    if (profile) {
      if (typeof profile.name === 'string') updateData.name = profile.name;
      if (typeof profile.avatarUrl === 'string') updateData.avatarUrl = profile.avatarUrl;
      if (typeof profile.birthday === 'string') updateData.birthday = profile.birthday;
      if (typeof profile.slogan === 'string') updateData.slogan = profile.slogan;
      // Email update is sensitive, usually requires re-verification. Skipping for now as ProfileSettings allows editing it?
      // existing users.service handles email updates. For now let's allow it if it's in the input, 
      // but usually we should check uniqueness. 
      // ProfileSettings calls it "email", let's assume simple update for now or stick to safe fields.
      // ProfileSettings has text input for email. Updating it needs care.
      // Let's rely on users.service.updateUser logic if we can, or replicate safe parts.
      // Simplest: only name/avatar for now. Email updates might break login if not handled carefully.
      // But user expects to update email.
      if (typeof profile.email === 'string' && profile.email !== user.email) {
         // Check existence
         const existing = await db.collection<UserDB>('users').findOne({ email: profile.email });
         if (existing) {
             return NextResponse.json({ message: 'Email already taken' }, { status: 400 });
         }
         updateData.email = profile.email;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await updateUserById(user._id, updateData);
    }

    // 3. Update Workspace Profile (if workspace exists)
    if (workspaceProfile && user.currentWorkspaceId) {
       // We need to update the specific element in the 'access' array.
       // MongoDB: 'access.$[elem].displayName': ...
       const wsId = user.currentWorkspaceId;
       
       const setFields: Record<string, any> = {};
       if (typeof workspaceProfile.displayName === 'string') setFields['access.$[elem].displayName'] = workspaceProfile.displayName;
       if (typeof workspaceProfile.avatarUrl === 'string') setFields['access.$[elem].avatarUrl'] = workspaceProfile.avatarUrl;
       
       // Role update is usually restricted. Ignoring role update here for safety unless User is Admin?
       // Let's skip role update in profile self-edit.

       if (Object.keys(setFields).length > 0) {
         await db.collection<WorkspaceDB>('workspaces').updateOne(
           { _id: wsId },
           { $set: setFields },
           {
             arrayFilters: [{ 'elem.userId': user._id }]
           }
         );
       }
    }

    // Return updated data
    // ... fetching again to be sure or return merged
    return NextResponse.json({ 
        profile: { ...profile, email: updateData.email || user.email }, 
        workspaceProfile: workspaceProfile 
    });

  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

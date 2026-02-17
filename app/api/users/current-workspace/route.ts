// app/api/users/current-workspace/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';
import { User } from '@/lib/users/users.types';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await req.json();

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json(
        { message: 'workspaceId required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase(process.env.DB_NAME!);

    const usersCollection = db.collection<User>('users');
    const workspacesCollection = db.collection<WorkspaceDB>('workspaces');

    console.log(`[API] Switch Workspace: Email=${session.user.email}, TargetWS=${workspaceId}`);

    const user = await usersCollection.findOne({
      email: session.user.email,
    });

    if (!user) {
      console.log('[API] User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 🔒 Sicherheitscheck: User muss im Workspace.access stehen
    // Wir suchen flexibel nach String oder ObjectId, da wir gerade migrieren
    const workspace = await workspacesCollection.findOne({
      _id: workspaceId,
      'access.userId': { $in: [user._id, user._id.toString()] }
    });

    if (!workspace) {
      console.log(`[API] Workspace not found or no access. Match criteria: WS_ID=${workspaceId}, UserID=${user._id}`);
      return NextResponse.json(
        { message: 'Kein Zugriff auf diesen Workspace.' },
        { status: 403 }
      );
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { currentWorkspaceId: workspaceId } }
    );
    
    console.log('[API] Success. Updated user currentWorkspaceId.');

    return NextResponse.json({
      message: 'Workspace ausgewählt.',
      currentWorkspaceId: workspaceId,
    });
  } catch (err) {
    console.error('PATCH /api/users/current-workspace error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

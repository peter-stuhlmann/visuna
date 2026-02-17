// app/api/workspaces/[workspaceId]/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { revokeUserFromWorkspace } from '@/lib/workspaces/workspace-users/workspace-users.service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const { workspaceId, userId } = await params;
    await revokeUserFromWorkspace(workspaceId, userId);

    return NextResponse.json(
      { message: 'Zugriff auf Workspace wurde entzogen.' },
      { status: 200 }
    );
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') {
      return NextResponse.json(
        { message: 'User oder Workspace nicht gefunden.' },
        { status: 404 }
      );
    }

    console.error('Revoke error:', e);
    return NextResponse.json(
      { message: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}

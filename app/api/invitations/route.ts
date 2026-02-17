// app/api/invitations/route.ts
import { NextResponse } from 'next/server';
import { inviteUser, getInvitationsForWorkspace } from '@/lib/invitations/invitations.service';
import { getWorkspaceById } from '@/lib/workspaces/workspaces.repo';
import { getUsersByIds } from '@/lib/users/users.repo';
import { getLoggedInUser } from '@/utils/getLoggedInUser';

/* ---------- POST: Create invitation ---------- */

export async function POST(req: Request) {
  try {
    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      return NextResponse.json({ message: 'Nicht autorisiert.' }, { status: 401 });
    }

    const data = await req.json();

    const invitation = await inviteUser({
      ...data,
      invitedBy: loggedInUser._id,
      invitedByName: loggedInUser.name || loggedInUser.email || '',
    });

    // Fetch updated users + invitations for frontend
    const workspace = await getWorkspaceById(data.workspaceId);
    let updatedUsers: any[] = [];
    if (workspace && Array.isArray(workspace.access)) {
      const userIds = workspace.access.map((a: any) => a.userId);
      updatedUsers = await getUsersByIds(userIds);
    }

    const invitations = await getInvitationsForWorkspace(data.workspaceId);

    return NextResponse.json(
      {
        message: 'Einladung erfolgreich versendet.',
        updatedUsers,
        invitations,
        invitation,
      },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.message === 'VALIDATION_ERROR') {
      return NextResponse.json({ message: e.details }, { status: 400 });
    }

    if (e.message === 'ALREADY_INVITED') {
      return NextResponse.json(
        { message: 'Benutzer:in wurde bereits eingeladen.' },
        { status: 409 }
      );
    }

    console.error('Invite error:', e);
    return NextResponse.json(
      { message: 'Fehler beim Einladen.' },
      { status: 500 }
    );
  }
}

/* ---------- GET: List invitations for workspace ---------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ message: 'workspaceId fehlt.' }, { status: 400 });
    }

    const invitations = await getInvitationsForWorkspace(workspaceId);
    return NextResponse.json({ invitations });
  } catch (e: any) {
    console.error('GET invitations error:', e);
    return NextResponse.json({ message: 'Fehler.' }, { status: 500 });
  }
}

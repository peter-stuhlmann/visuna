// app/api/invitations/[id]/route.ts
import { NextResponse } from 'next/server';
import { reinviteUser, removeInvitation, revokeInvitation } from '@/lib/invitations/invitations.service';
import { getInvitationsForWorkspace } from '@/lib/invitations/invitations.service';
import { findInvitationById } from '@/lib/invitations/invitations.repo';

/* ---------- POST: Re-invite (reset to pending + resend email) ---------- */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await reinviteUser(id);

    const invitations = await getInvitationsForWorkspace(updated.workspaceId);

    return NextResponse.json({
      message: 'Einladung erneut versendet.',
      invitations,
    });
  } catch (e: any) {
    console.error('Reinvite error:', e);

    if (e.message === 'INVITATION_NOT_FOUND') {
      return NextResponse.json({ message: 'Einladung nicht gefunden.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Fehler.' }, { status: 500 });
  }
}

/* ---------- DELETE: Remove invitation ---------- */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get invitation to know workspace for refresh
    const invitation = await findInvitationById(id);
    if (!invitation) {
      return NextResponse.json({ message: 'Einladung nicht gefunden.' }, { status: 404 });
    }

    await removeInvitation(id);

    const invitations = await getInvitationsForWorkspace(invitation.workspaceId);

    return NextResponse.json({
      message: 'Einladung gelöscht.',
      invitations,
    });
  } catch (e: any) {
    console.error('Delete invitation error:', e);
    return NextResponse.json({ message: 'Fehler.' }, { status: 500 });
  }
}

/* ---------- PATCH: Revoke pending invitation ---------- */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitation = await revokeInvitation(id);

    const invitations = await getInvitationsForWorkspace(invitation.workspaceId);

    return NextResponse.json({
      message: 'Einladung zurückgezogen.',
      invitations,
    });
  } catch (e: any) {
    console.error('Revoke invitation error:', e);

    if (e.message === 'INVITATION_NOT_FOUND') {
      return NextResponse.json({ message: 'Einladung nicht gefunden.' }, { status: 404 });
    }
    if (e.message === 'NOT_PENDING') {
      return NextResponse.json({ message: 'Einladung ist nicht ausstehend.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Fehler.' }, { status: 500 });
  }
}

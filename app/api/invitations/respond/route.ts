// app/api/invitations/respond/route.ts
import { NextResponse } from 'next/server';
import { acceptInvitation, declineInvitation } from '@/lib/invitations/invitations.service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');
  const baseUrl = process.env.NEXTAUTH_URL || '';

  if (!token || !action) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  try {
    if (action === 'accept') {
      const { invitation } = await acceptInvitation(token);
      // Redirect to landing page with invitation info
      const params = new URLSearchParams({
        status: 'accepted',
        workspace: invitation.workspaceName || '',
        invitedBy: invitation.invitedByName || '',
      });
      return NextResponse.redirect(`${baseUrl}/einladung?${params.toString()}`);
    }

    if (action === 'decline') {
      const invitation = await declineInvitation(token);
      const params = new URLSearchParams({
        status: 'declined',
        workspace: invitation.workspaceName || '',
      });
      return NextResponse.redirect(`${baseUrl}/einladung?${params.toString()}`);
    }

    return NextResponse.redirect(`${baseUrl}/login`);
  } catch (e: any) {
    console.error('Invitation respond error:', e);

    if (e.message === 'INVITATION_NOT_FOUND') {
      return NextResponse.redirect(
        `${baseUrl}/einladung?status=not_found`
      );
    }

    if (e.message === 'INVITATION_ALREADY_RESPONDED') {
      return NextResponse.redirect(
        `${baseUrl}/einladung?status=not_active`
      );
    }

    return NextResponse.redirect(`${baseUrl}/einladung?status=error`);
  }
}

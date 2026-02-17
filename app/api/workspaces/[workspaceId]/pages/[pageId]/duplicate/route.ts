import { NextResponse } from 'next/server';
import { duplicatePage } from '@/lib/workspaces/pages/pages.service';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

/* ---------- POST ---------- */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await params;

    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const page = await duplicatePage(pageId, workspaceId);
    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Seite nicht gefunden.' }, { status: 404 });
    }

    console.error('POST /api/workspaces/[workspaceId]/pages/[pageId]/duplicate error:', e);
    return NextResponse.json({ message: 'Fehler beim Duplizieren.' }, { status: 500 });
  }
}

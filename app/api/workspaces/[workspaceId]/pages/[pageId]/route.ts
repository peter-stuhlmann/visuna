// app/api/workspaces/[id]/pages/[id]/route.ts
import { NextResponse } from 'next/server';
import {
  getPageById,
  deletePage,
  updatePagePublishStatus,
} from '@/lib/workspaces/pages/pages.service';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

/* ---------- GET ---------- */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await params;
    
    // Auth Check
    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const page = await getPageById(pageId, workspaceId);
    return NextResponse.json({ page });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }

    console.error('GET /api/workspaces/[workspaceId]/pages/[pageId] error:', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

/* ---------- PATCH ---------- */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await params;

    // Auth Check
    const { hasAccess, user } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Template-ID-Update
    if (body.headerTemplateId !== undefined || body.footerTemplateId !== undefined) {
      const { updatePageTemplateIds } = await import('@/lib/workspaces/pages/pages.repo');
      const templateIds: { headerTemplateId?: string; footerTemplateId?: string } = {};
      if (body.headerTemplateId !== undefined) templateIds.headerTemplateId = body.headerTemplateId;
      if (body.footerTemplateId !== undefined) templateIds.footerTemplateId = body.footerTemplateId;
      const page = await updatePageTemplateIds(pageId, workspaceId, templateIds, user?._id);
      return NextResponse.json({ page });
    }

    // Publish-Status-Update (bestehende Logik)
    const { publishStatus } = body as { publishStatus: PageVisibility };
    const page = await updatePagePublishStatus(
      pageId,
      workspaceId,
      publishStatus,
      user?._id
    );

    return NextResponse.json({ page });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}
/* ---------- DELETE ---------- */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await params;

    // Auth Check
    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const page = await deletePage(pageId, workspaceId);
    return NextResponse.json({ page });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }

    console.error('DELETE /api/workspaces/[id]/pages/[id] error:', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

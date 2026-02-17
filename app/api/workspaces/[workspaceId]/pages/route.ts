import { NextResponse } from 'next/server';
import { createPage } from '@/lib/workspaces/pages/pages.service';
import { createPageSchema } from '@/lib/workspaces/pages/pages.schema';
import { searchPages } from '@/lib/workspaces/pages/pages.service';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    // Auth Check
    const { hasAccess, user } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = createPageSchema.parse(body);

    // Ensure data validation matches workspace scope (optional but good practice)
    if (data.workspaceId && data.workspaceId !== workspaceId) {
         return NextResponse.json({ message: 'Workspace ID mismatch' }, { status: 400 });
    }
    // Force workspaceId from route if not in body or to be safe
    data.workspaceId = workspaceId;

    const page = await createPage(data, user?._id);

    return NextResponse.json(
      {
        message: 'Seite erfolgreich gespeichert.',
        page,
      },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ message: e.errors }, { status: 400 });
    }

    if (e.message === 'SLUG_EXISTS') {
      return NextResponse.json(
        { message: 'Slug ist im Workspace bereits vergeben.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Fehler beim Erstellen der Seite.' },
      { status: 500 }
    );
  }
}

import { fetchPagesPaginated } from '@/lib/workspaces/pages/pages.repo';
import type { PageVisibility } from '@/lib/workspaces/pages/pages.types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { workspaceId } = await params;

  // Auth Check
  const { hasAccess } = await checkWorkspaceAccess(workspaceId);
  if (!hasAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const q = (searchParams.get('q') || '').trim();

  // If q is present, use the existing search (used by Explorer)
  if (q) {
    const limit = Number(searchParams.get('limit') || 8);
    const results = await searchPages(workspaceId, q, limit);
    return NextResponse.json({ results });
  }

  // Paginated list (used by PagesList)
  const limit = Math.min(Number(searchParams.get('limit') || 10), 100);
  const skip = Math.max(Number(searchParams.get('skip') || 0), 0);
  const sortBy = (['name', 'slug', 'createdAt'].includes(searchParams.get('sortBy') || '')
    ? searchParams.get('sortBy')
    : 'name') as 'name' | 'slug' | 'createdAt';
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc';
  const nameFilter = searchParams.get('name') || undefined;
  const statusRaw = searchParams.get('status') || '';
  const statusFilter = statusRaw
    ? (statusRaw.split(',').filter(Boolean) as PageVisibility[])
    : undefined;

  const { pages, total } = await fetchPagesPaginated({
    workspaceId,
    limit,
    skip,
    sortBy,
    sortDir,
    nameFilter,
    statusFilter,
  });

  return NextResponse.json({ pages, total });
}


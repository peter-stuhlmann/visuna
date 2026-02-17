// app/api/workspaces/[workspaceId]/route.ts
import { NextResponse } from 'next/server';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import { deleteWorkspaceService } from '@/lib/workspaces/workspaces.service';

/* ---------- GET ---------- */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    // Auth Check
    const { hasAccess, workspace } = await checkWorkspaceAccess(workspaceId);

    if (!hasAccess || !workspace) {
      // Unterscheide 401/404/403? 
      // User wollte: "Außer api/users darf keine API Route erreichbar sein, wenn der User keinen Zugriff hat" -> 403 oder 404 wenn nicht gefunden.
      return NextResponse.json(
        { message: 'Forbidden or Not Found' },
        { status: 403 }
      );
    }

    return NextResponse.json(workspace);
  } catch (e) {
    console.error('GET /api/workspaces/:id error:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

/* ---------- PATCH ---------- */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const body = await req.json();

    // Auth Check
    const { hasAccess, role, workspace } = await checkWorkspaceAccess(workspaceId);

    if (!hasAccess || !workspace) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }


    // Optional: Admin only check for plan updates?
    // User said "User can change status for testing purposes", so Redakteur check might be too strict,
    // but usually only admins change plan. I'll stick to admin for now as it's cleaner.
    // [EDIT]: User requested simplified testing, so we remove the strict check.
    /*
    if (body.plan && role !== 'admin') {
       return NextResponse.json({ message: 'Only admins can change plan' }, { status: 403 });
    }
    */

    const { updateWorkspaceService } = await import('@/lib/workspaces/workspaces.service');
    
    const updated = await updateWorkspaceService({
      workspaceId,
      name: body.name,
      domain: body.domain,
      thumbnail: body.thumbnail,
      plan: body.plan,
    });

    return NextResponse.json({ workspace: updated });
  } catch (e) {
    console.error('PATCH /api/workspaces/:id error:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

/* ---------- DELETE ---------- */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Auth Check
    const { hasAccess, role, workspace } = await checkWorkspaceAccess(workspaceId);

    if (!hasAccess || !workspace) {
      return NextResponse.json(
        { message: 'Forbidden or Not Found' },
        { status: 403 }
      );
    }

    // Role Check (Admin only)
    if (role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admins can delete workspaces.' },
        { status: 403 }
      );
    }

    await deleteWorkspaceService(workspaceId);

    return NextResponse.json({ message: 'Workspace deleted' });
  } catch (e) {
    console.error('DELETE /api/workspaces/:id error:', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

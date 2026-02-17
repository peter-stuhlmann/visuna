// app/api/workspaces/[workspaceId]/logs/route.ts
import { NextResponse } from 'next/server';
import { createLog, getLogs } from '@/lib/workspaces/logs/logs.service';
import { deleteLogs } from '@/lib/workspaces/logs/logs.repo';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const data = await req.json();

    const log = await createLog({
      workspaceId,
      code: data.code ?? '',
      action: data.action,
      category: data.category,
      entityType: data.entityType ?? data.category ?? 'unknown',
      entityId: data.entityId ?? null,
      entityName: data.entityName ?? null,
      description: data.description ?? data.activity ?? '',
      userId: data.userId ?? null,
      userEmail: data.userEmail ?? data.email ?? null,
      userName: data.userName ?? null,
      details: data.details ?? null,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (e: any) {
    if (e.message === 'VALIDATION_ERROR') {
      return NextResponse.json({ message: e.details }, { status: 400 });
    }

    console.error('Create workspace log error:', e);
    return NextResponse.json(
      { message: 'Fehler beim Speichern des Logs' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const logs = await getLogs(workspaceId, limit);

    return NextResponse.json({ logs });
  } catch (e) {
    console.error('GET workspace logs error:', e);
    return NextResponse.json(
      { message: 'Fehler beim Laden der Logs' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Strict superadmin-only access
    const { hasAccess, role } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess || role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Nur SuperAdmins dürfen Logs löschen.' },
        { status: 403 }
      );
    }

    const { logIds } = await req.json();

    if (!Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { message: 'logIds (Array) ist erforderlich.' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteLogs(workspaceId, logIds);

    return NextResponse.json({ deletedCount });
  } catch (e) {
    console.error('DELETE workspace logs error:', e);
    return NextResponse.json(
      { message: 'Fehler beim Löschen der Logs' },
      { status: 500 }
    );
  }
}

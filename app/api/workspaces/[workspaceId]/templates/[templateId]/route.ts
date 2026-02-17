import { NextResponse } from 'next/server';
import {
  getTemplateById,
  updateTemplateService,
  deleteTemplate,
} from '@/lib/workspaces/templates/templates.service';
import { updateTemplateSchema } from '@/lib/workspaces/templates/templates.schema';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

/* ---------- GET ---------- */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;

    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const template = await getTemplateById(templateId, workspaceId);
    return NextResponse.json({ template });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

/* ---------- PATCH ---------- */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;

    const { hasAccess, user } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updates = updateTemplateSchema.parse(body);

    const template = await updateTemplateService(
      templateId,
      workspaceId,
      updates,
      user?._id
    );

    return NextResponse.json({ template });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ message: e.errors }, { status: 400 });
    }
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

/* ---------- DELETE ---------- */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  try {
    const { workspaceId, templateId } = await params;

    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const template = await deleteTemplate(templateId, workspaceId);
    return NextResponse.json({ template });
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Nicht gefunden.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

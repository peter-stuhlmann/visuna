import { NextResponse } from 'next/server';
import { createTemplate, listTemplates } from '@/lib/workspaces/templates/templates.service';
import { createTemplateSchema } from '@/lib/workspaces/templates/templates.schema';
import { TemplateType } from '@/lib/workspaces/templates/templates.types';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

/* ---------- POST ---------- */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const { hasAccess, user } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = createTemplateSchema.parse({ ...body, workspaceId });

    const template = await createTemplate(data, user?._id);

    return NextResponse.json(
      { message: 'Template erfolgreich erstellt.', template },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ message: e.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Fehler beim Erstellen des Templates.' },
      { status: 500 }
    );
  }
}

/* ---------- GET ---------- */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as TemplateType | null;

    const templates = await listTemplates(workspaceId, type || undefined);

    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json(
      { message: 'Fehler beim Laden der Templates.' },
      { status: 500 }
    );
  }
}

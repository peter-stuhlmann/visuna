import { NextResponse } from 'next/server';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import { fetchPagesByTemplateId } from '@/lib/workspaces/pages/pages.repo';

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

    const pages = await fetchPagesByTemplateId(workspaceId, templateId);

    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
}

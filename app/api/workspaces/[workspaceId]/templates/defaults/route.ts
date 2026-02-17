import { NextResponse } from 'next/server';
import { fetchDefaultTemplate } from '@/lib/workspaces/templates/templates.repo';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

/**
 * GET /api/workspaces/[workspaceId]/templates/defaults
 * Liefert die Elemente der Default-Header- und Default-Footer-Templates in einem einzigen Request.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [headerTpl, footerTpl] = await Promise.all([
      fetchDefaultTemplate(workspaceId, 'header'),
      fetchDefaultTemplate(workspaceId, 'footer'),
    ]);

    const headerElements = headerTpl && Array.isArray(headerTpl.data) ? headerTpl.data : [];
    const footerElements = footerTpl && Array.isArray(footerTpl.data) ? footerTpl.data : [];

    return NextResponse.json({ headerElements, footerElements });
  } catch {
    return NextResponse.json(
      { message: 'Fehler beim Laden der Default-Templates.' },
      { status: 500 }
    );
  }
}

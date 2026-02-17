import { NextResponse } from 'next/server';
// Explicit path with alias and cache-busting comment to resolve Turbopack staleness
import { getForms } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Auth Check
    const { hasAccess } = await checkWorkspaceAccess(workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const forms = await getForms();

    return NextResponse.json({ results: forms || [] });
  } catch (error) {
    console.error('Error in forms API:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

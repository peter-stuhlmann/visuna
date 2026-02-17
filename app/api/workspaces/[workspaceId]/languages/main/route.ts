import { NextResponse } from 'next/server';
import { getMainWorkspaceLanguage } from '@/lib/workspaces/languages/languages.service';

export async function GET(
  _req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace-ID ist erforderlich.' },
        { status: 400 }
      );
    }

    const data = await getMainWorkspaceLanguage(workspaceId);

    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /workspaces/[id]/languages/main error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
}

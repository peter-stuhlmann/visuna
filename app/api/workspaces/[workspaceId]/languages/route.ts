import { NextResponse } from 'next/server';
import {
  getAllWorkspaceLanguages,
  saveWorkspaceLanguagesService,
} from '@/lib/workspaces/languages/languages.service';

/* ---------- GET ---------- */

export async function GET(
  _req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json({ error: 'NO_WORKSPACE_ID' }, { status: 400 });
    }

    const data = await getAllWorkspaceLanguages(workspaceId);
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /languages error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

/* ---------- POST (SAVE) ---------- */

export async function POST(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: 'NO_WORKSPACE_ID' }, { status: 400 });
    }

    const result = await saveWorkspaceLanguagesService(workspaceId, body);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err: any) {
    if (
      [
        'NO_CONTENT_LANGUAGES',
        'NO_FRONTEND_LANGUAGES',
        'FRONTEND_NOT_SUBSET_OF_CONTENT',
      ].includes(err.message)
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error('POST /languages error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

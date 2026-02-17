import { NextResponse } from 'next/server';
import { getSeo, saveSeo } from '@/lib/workspaces/pages/seo/seo.service';

export async function GET(
  _req: Request,
  context: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await context.params;

    const seo = await getSeo(pageId, workspaceId);

    return NextResponse.json({ seo });
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') {
      return NextResponse.json(
        { message: 'Seite nicht gefunden.' },
        { status: 404 }
      );
    }

    console.error('GET /api/workspaces/[pageId]/pages/[pageId]/seo error:', e);
    return NextResponse.json(
      { message: 'Fehler beim Laden der SEO-Daten.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ pageId: string; workspaceId: string }> }
) {
  try {
    const { pageId, workspaceId } = await context.params;
    const body = await req.json();

    await saveSeo(pageId, body.seo, workspaceId);

    return NextResponse.json({
      message: 'SEO erfolgreich gespeichert.',
    });
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') {
      return NextResponse.json(
        { message: 'Seite nicht gefunden.' },
        { status: 404 }
      );
    }

    console.error(
      'PATCH /api/workspaces/[pageId]/pages/[pageId]/seo error:',
      e
    );
    return NextResponse.json(
      { message: 'Fehler beim Speichern der SEO-Daten.' },
      { status: 500 }
    );
  }
}

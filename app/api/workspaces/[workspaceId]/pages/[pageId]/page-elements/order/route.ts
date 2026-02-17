// app/api/workspaces/pages/page-elements/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reorderPageElements } from '@/lib/workspaces/pages/page-elements/page-elements.service';

type IncomingItem = { id: string; order: number };

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; pageId: string }> }
) => {
  try {
    const { pageId } = await params;
    const body = await req.json();
    const items: unknown = body?.items;

    if (!pageId) {
      return NextResponse.json(
        { message: 'Ungültige pageId.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'items fehlt oder ist leer.' },
        { status: 400 }
      );
    }

    const result = await reorderPageElements(pageId, items as IncomingItem[]);

    return NextResponse.json(
      {
        message: 'Order aktualisiert.',
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.message === 'NO_VALID_ITEMS') {
      return NextResponse.json(
        { message: 'Keine gültigen items vorhanden.' },
        { status: 400 }
      );
    }

    console.error('[update-page-elements-order]', err);
    return NextResponse.json({ message: 'Interner Fehler.' }, { status: 500 });
  }
};

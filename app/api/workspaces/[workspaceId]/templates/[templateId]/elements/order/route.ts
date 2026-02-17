// app/api/workspaces/[workspaceId]/templates/[templateId]/elements/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reorderTemplateElements } from '@/lib/workspaces/templates/templates.repo';

type Params = Promise<{ workspaceId: string; templateId: string }>;

export const POST = async (
  req: NextRequest,
  { params }: { params: Params }
) => {
  try {
    const { workspaceId, templateId } = await params;
    const body = await req.json();
    const items: unknown = body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'items fehlt oder ist leer.' },
        { status: 400 }
      );
    }

    const result = await reorderTemplateElements(
      templateId,
      workspaceId,
      items as { id: string; order: number }[]
    );

    return NextResponse.json(
      { message: 'Order aktualisiert.', ...result },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.message === 'TEMPLATE_NOT_FOUND') {
      return NextResponse.json(
        { message: 'Template nicht gefunden.' },
        { status: 404 }
      );
    }
    console.error('[REORDER TEMPLATE ELEMENTS]', err);
    return NextResponse.json({ message: 'Interner Fehler.' }, { status: 500 });
  }
};

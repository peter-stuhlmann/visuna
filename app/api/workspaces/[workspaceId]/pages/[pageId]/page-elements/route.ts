// app/api/workspaces/pages/page-elements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPageElement } from '@/lib/workspaces/pages/page-elements/page-elements.service';

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const element = await createPageElement(body);

    return NextResponse.json({ element }, { status: 201 });
  } catch (e: any) {
    if (e.message === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { message: 'pageId und element sind erforderlich.' },
        { status: 400 }
      );
    }

    if (e.message === 'PAGE_NOT_FOUND') {
      return NextResponse.json(
        { message: 'Page nicht gefunden.' },
        { status: 404 }
      );
    }

    console.error('[CREATE PAGE ELEMENT]', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
};

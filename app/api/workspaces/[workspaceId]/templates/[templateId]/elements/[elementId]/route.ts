// app/api/workspaces/[workspaceId]/templates/[templateId]/elements/[elementId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  updateTemplateElement,
  removeTemplateElement,
} from '@/lib/workspaces/templates/templates.repo';

type Params = Promise<{
  workspaceId: string;
  templateId: string;
  elementId: string;
}>;

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Params }
) => {
  try {
    const { workspaceId, templateId, elementId } = await params;
    const body = await req.json();

    const data = body?.data;
    const patch = body?.patch;

    const updated = await updateTemplateElement(
      templateId,
      workspaceId,
      elementId,
      { data, patch }
    );

    if (!updated) {
      return NextResponse.json(
        { message: 'Element nicht gefunden.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Element aktualisiert.', element: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[UPDATE TEMPLATE ELEMENT]', error);
    return NextResponse.json(
      { message: 'Serverfehler beim Update.' },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Params }
) => {
  try {
    const { workspaceId, templateId, elementId } = await params;

    const deleted = await removeTemplateElement(
      templateId,
      workspaceId,
      elementId
    );

    if (!deleted) {
      return NextResponse.json(
        { message: 'Element nicht gefunden.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Element gelöscht.',
      elementId,
    });
  } catch (error) {
    console.error('[DELETE TEMPLATE ELEMENT]', error);
    return NextResponse.json(
      { message: 'Interner Serverfehler.' },
      { status: 500 }
    );
  }
};

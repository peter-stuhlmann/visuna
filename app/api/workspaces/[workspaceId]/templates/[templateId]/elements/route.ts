// app/api/workspaces/[workspaceId]/templates/[templateId]/elements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  addTemplateElement,
  fetchTemplateElements,
} from '@/lib/workspaces/templates/templates.repo';

type Params = Promise<{ workspaceId: string; templateId: string }>;

export const POST = async (req: NextRequest, { params }: { params: Params }) => {
  try {
    const { workspaceId, templateId } = await params;
    const body = await req.json();

    const { element, order, data, name, visible } = body ?? {};

    if (!element || typeof element !== 'string') {
      return NextResponse.json(
        { message: 'element ist erforderlich.' },
        { status: 400 }
      );
    }

    const el = await addTemplateElement(templateId, workspaceId, {
      element,
      order,
      data,
      name,
      visible,
    });

    return NextResponse.json({ element: el }, { status: 201 });
  } catch (e: any) {
    if (e.message === 'TEMPLATE_NOT_FOUND') {
      return NextResponse.json(
        { message: 'Template nicht gefunden.' },
        { status: 404 }
      );
    }
    console.error('[CREATE TEMPLATE ELEMENT]', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
};

export const GET = async (_req: NextRequest, { params }: { params: Params }) => {
  try {
    const { workspaceId, templateId } = await params;
    const elements = await fetchTemplateElements(templateId, workspaceId);

    return NextResponse.json({ elements }, { status: 200 });
  } catch (e: any) {
    if (e.message === 'TEMPLATE_NOT_FOUND') {
      return NextResponse.json(
        { message: 'Template nicht gefunden.' },
        { status: 404 }
      );
    }
    console.error('[GET TEMPLATE ELEMENTS]', e);
    return NextResponse.json({ message: 'Serverfehler.' }, { status: 500 });
  }
};

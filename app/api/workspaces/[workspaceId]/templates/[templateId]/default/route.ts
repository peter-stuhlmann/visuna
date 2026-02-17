import { NextRequest, NextResponse } from 'next/server';
import { setDefaultTemplate } from '@/lib/workspaces/templates/templates.repo';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  const { workspaceId, templateId } = await params;

  try {
    const body = await req.json();
    const { templateType } = body;

    if (!templateType) {
      return NextResponse.json({ error: 'templateType is required' }, { status: 400 });
    }

    const updated = await setDefaultTemplate(templateId, workspaceId, templateType);
    if (!updated) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ template: updated }, { status: 200 });
  } catch (err) {
    console.error('[SET DEFAULT TEMPLATE]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

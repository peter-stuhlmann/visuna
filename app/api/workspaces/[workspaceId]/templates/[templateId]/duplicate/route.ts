import { NextRequest, NextResponse } from 'next/server';
import { duplicateTemplate } from '@/lib/workspaces/templates/templates.repo';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; templateId: string }> }
) {
  const { workspaceId, templateId } = await params;

  try {
    const duplicate = await duplicateTemplate(templateId, workspaceId);
    if (!duplicate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ template: duplicate }, { status: 201 });
  } catch (err) {
    console.error('[DUPLICATE TEMPLATE]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { cookies } from 'next/headers';
import { fetchTemplates, fetchTemplateById } from '@/lib/workspaces/templates/templates.repo';
import { Breadcrumbs } from '@/components/content-elements/default';
import TemplatesSplitView from '@/components/templates/TemplatesSplitView';

export default async function HeaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { workspaceId } = await params;
  const sp = await searchParams;
  const selectedTemplateId = typeof sp.templateId === 'string' ? sp.templateId : null;

  const cookieStore = await cookies();
  const initSize = Number(cookieStore.get('templates-header-split-view-size')?.value);
  const initOrientation = cookieStore.get('templates-header-split-view-orientation')?.value;
  const initFlipped = cookieStore.get('templates-header-split-view-flipped')?.value === 'true';

  const templates = await fetchTemplates(workspaceId, 'header');

  let selectedTemplate = null;
  if (selectedTemplateId) {
    try {
      selectedTemplate = await fetchTemplateById(selectedTemplateId, workspaceId);
    } catch {}
  }

  return (
      <TemplatesSplitView
        templates={templates}
        workspaceId={workspaceId}
        templateType="header"
        templateLabel="Header"
        selectedTemplateId={selectedTemplateId}
        selectedTemplate={selectedTemplate}
        initialSize={!isNaN(initSize) ? initSize : undefined}
        initialOrientation={initOrientation === 'horizontal' || initOrientation === 'vertical' ? initOrientation : undefined}
        initialFlipped={initFlipped}
      />
  );
}

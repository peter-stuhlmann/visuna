import { cookies } from 'next/headers';
import { fetchTemplates, fetchTemplateById } from '@/lib/workspaces/templates/templates.repo';
import { Breadcrumbs } from '@/components/content-elements/default';
import TemplatesSplitView from '@/components/templates/TemplatesSplitView';

export default async function FormularePage({
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
  const initSize = Number(cookieStore.get('templates-forms-split-view-size')?.value);
  const initOrientation = cookieStore.get('templates-forms-split-view-orientation')?.value;
  const initFlipped = cookieStore.get('templates-forms-split-view-flipped')?.value === 'true';

  const templates = await fetchTemplates(workspaceId, 'forms');

  let selectedTemplate = null;
  if (selectedTemplateId) {
    try {
      selectedTemplate = await fetchTemplateById(selectedTemplateId, workspaceId);
    } catch {}
  }

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Templates', en: 'Templates' },
              href: {
                de: `/workspaces/${workspaceId}/templates`,
                en: `/workspaces/${workspaceId}/templates`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Formulare', en: 'Forms' },
              href: {
                de: `/workspaces/${workspaceId}/templates/formulare`,
                en: `/workspaces/${workspaceId}/templates/formulare`,
              },
              highlighted: true,
            },
          ],
        }}
      />

      <TemplatesSplitView
        templates={templates}
        workspaceId={workspaceId}
        templateType="forms"
        templateLabel="Formulare"
        selectedTemplateId={selectedTemplateId}
        selectedTemplate={selectedTemplate}
        initialSize={!isNaN(initSize) ? initSize : undefined}
        initialOrientation={initOrientation === 'horizontal' || initOrientation === 'vertical' ? initOrientation : undefined}
        initialFlipped={initFlipped}
      />
    </>
  );
}

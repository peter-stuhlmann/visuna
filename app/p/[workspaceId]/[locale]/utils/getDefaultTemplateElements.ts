import { fetchDefaultTemplate, fetchTemplateById } from '@/lib/workspaces/templates/templates.repo';
import type { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import type { TemplateType } from '@/lib/workspaces/templates/templates.types';

/**
 * Fetches template elements for a given type & workspace.
 * If a specific templateId is provided, loads that template.
 * Otherwise falls back to the default (★) template.
 * Returns an empty array if no template is found.
 * All elements are forced to visible for public rendering.
 */
export async function getDefaultTemplateElements(
  workspaceId: string,
  templateType: TemplateType,
  templateId?: string
): Promise<PageElement[]> {
  const tpl = templateId
    ? await fetchTemplateById(templateId, workspaceId)
    : await fetchDefaultTemplate(workspaceId, templateType);
  if (!tpl) return [];
  const elements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];
  // Force visibility — template elements should always render on the public page
  return elements.map((el) => ({ ...el, visible: true }));
}

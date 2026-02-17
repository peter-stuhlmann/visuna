// lib/workspaces/templates/templates.service.ts
import { CreateTemplateInput } from './templates.schema';
import {
  insertTemplate,
  fetchTemplates,
  fetchTemplateById,
  updateTemplate as repoUpdate,
  deleteTemplateById,
} from './templates.repo';
import { TemplateDB, TemplateSummary, TemplateType, TemplatePublishStatus } from './templates.types';
import saveLog from '@/components/logs/saveLog';

/* ---------- CREATE ---------- */

export async function createTemplate(
  input: CreateTemplateInput,
  userId?: string
): Promise<TemplateDB> {
  const template = await insertTemplate({ ...input, createdBy: userId });
  if (!template) throw new Error('CREATE_FAILED');

  await saveLog({
    workspaceId: input.workspaceId,
    code: '1101',
    action: 'created',
    category: 'template',
    entityType: 'template',
    entityId: template._id,
    entityName: template.name,
    description: `Template "${template.name}" erstellt.`,
  });
  return template;
}

/* ---------- LIST ---------- */

export async function listTemplates(
  workspaceId: string,
  templateType?: TemplateType
): Promise<TemplateSummary[]> {
  return fetchTemplates(workspaceId, templateType);
}

/* ---------- GET BY ID ---------- */

export async function getTemplateById(
  templateId: string,
  workspaceId: string
): Promise<TemplateDB> {
  const template = await fetchTemplateById(templateId, workspaceId);
  if (!template) throw new Error('NOT_FOUND');
  return template;
}

/* ---------- UPDATE ---------- */

export async function updateTemplateService(
  templateId: string,
  workspaceId: string,
  updates: {
    name?: string;
    publishStatus?: TemplatePublishStatus;
    data?: any;
  },
  userId?: string
): Promise<TemplateDB> {
  const template = await repoUpdate(templateId, workspaceId, updates, userId);
  if (!template) throw new Error('NOT_FOUND');

  if (updates.publishStatus) {
    await saveLog({
      workspaceId,
      code: '1104',
      action: 'status_changed',
      category: 'template',
      entityType: 'template',
      entityId: template._id,
      entityName: template.name,
      description: `Template "${template.name}" Status geändert zu "${updates.publishStatus}".`,
      details: { newStatus: updates.publishStatus },
    });
  } else {
    await saveLog({
      workspaceId,
      code: '1102',
      action: 'updated',
      category: 'template',
      entityType: 'template',
      entityId: template._id,
      entityName: template.name,
      description: `Template "${template.name}" aktualisiert.`,
    });
  }

  return template;
}

/* ---------- DELETE ---------- */

export async function deleteTemplate(
  templateId: string,
  workspaceId: string
): Promise<TemplateDB> {
  const template = await deleteTemplateById(templateId, workspaceId);
  if (!template) throw new Error('NOT_FOUND');

  await saveLog({
    workspaceId,
    code: '1103',
    action: 'deleted',
    category: 'template',
    entityType: 'template',
    entityId: template._id,
    entityName: template.name,
    description: `Template "${template.name}" gelöscht.`,
  });
  return template;
}

// lib/workspaces/templates/templates.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { TemplateDB, TemplateSummary, TemplateType, TemplatePublishStatus } from './templates.types';
import { createDbDocId } from '@/utils/createDbDocId';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

/* ---------- type guard ---------- */

function isTemplateDb(doc: any): doc is TemplateDB {
  return (
    doc &&
    typeof doc._id === 'string' &&
    typeof doc.name === 'string' &&
    typeof doc.template === 'string' &&
    typeof doc.workspaceId === 'string' &&
    typeof doc.publishStatus === 'string' &&
    doc.createdAt instanceof Date
  );
}

/* ---------- mappers ---------- */

function mapDbToSummary(t: TemplateDB): TemplateSummary {
  return {
    _id: t._id,
    name: t.name,
    template: t.template,
    workspaceId: t.workspaceId,
    publishStatus: t.publishStatus,
    isDefault: t.isDefault,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    createdBy: t.createdBy,
    updatedBy: t.updatedBy,
  };
}

/* ---------- INSERT ---------- */

export async function insertTemplate(data: {
  name: string;
  template: TemplateType;
  workspaceId: string;
  createdBy?: string;
}): Promise<TemplateDB> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const template: TemplateDB = {
    _id: createDbDocId('tpl'),
    name: data.name,
    template: data.template,
    workspaceId: data.workspaceId,
    publishStatus: 'inactive',
    data: [],
    createdAt: new Date(),
    createdBy: data.createdBy,
  };

  await db.collection<TemplateDB>('templates').insertOne(template);
  return template;
}

/* ---------- GET list ---------- */

export async function fetchTemplates(
  workspaceId: string,
  templateType?: TemplateType
): Promise<TemplateSummary[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const filter: any = { workspaceId };
  if (templateType) filter.template = templateType;

  const docs = await db
    .collection<TemplateDB>('templates')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return docs.filter(isTemplateDb).map(mapDbToSummary);
}

/* ---------- GET by id ---------- */

export async function fetchTemplateById(
  id: string,
  workspaceId: string
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<TemplateDB>('templates').findOne({
    _id: id,
    workspaceId,
  });

  return isTemplateDb(raw) ? raw : null;
}

/* ---------- GET default by type ---------- */

export async function fetchDefaultTemplate(
  workspaceId: string,
  templateType: TemplateType
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<TemplateDB>('templates').findOne({
    workspaceId,
    template: templateType,
    isDefault: true,
  });

  return raw && isTemplateDb(raw) ? raw : null;
}

/* ---------- UPDATE ---------- */

export async function updateTemplate(
  id: string,
  workspaceId: string,
  updates: {
    name?: string;
    publishStatus?: TemplatePublishStatus;
    data?: any;
  },
  userId?: string
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const setFields: any = { updatedAt: new Date() };
  if (updates.name !== undefined) setFields.name = updates.name;
  if (updates.publishStatus !== undefined) setFields.publishStatus = updates.publishStatus;
  if (updates.data !== undefined) setFields.data = updates.data;
  if (userId) setFields.updatedBy = userId;

  const result = (await db
    .collection<TemplateDB>('templates')
    .findOneAndUpdate(
      { _id: id, workspaceId },
      { $set: setFields },
      { returnDocument: 'after' }
    )) as any;

  const updated = (result?.value ? result.value : result) as TemplateDB | null;
  return updated && isTemplateDb(updated) ? updated : null;
}

/* ---------- DELETE ---------- */

export async function deleteTemplateById(
  id: string,
  workspaceId: string
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<TemplateDB>('templates').findOne({
    _id: id,
    workspaceId,
  });

  if (!isTemplateDb(raw)) return null;

  await db.collection<TemplateDB>('templates').deleteOne({
    _id: id,
    workspaceId,
  });

  return raw;
}

/* ---------- DUPLICATE ---------- */

export async function duplicateTemplate(
  id: string,
  workspaceId: string
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  const original = await col.findOne({ _id: id, workspaceId });
  if (!original || !isTemplateDb(original)) return null;

  const duplicate: TemplateDB = {
    ...original,
    _id: createDbDocId('tpl'),
    name: `DUPLIKAT von ${original.name}`,
    isDefault: false,
    data: Array.isArray(original.data)
      ? original.data.map((el: any) => ({ ...el, _id: createDbDocId('tpl-el') }))
      : [],
    createdAt: new Date(),
    updatedAt: undefined,
  };

  await col.insertOne(duplicate);
  return duplicate;
}

/* ---------- SET DEFAULT ---------- */

export async function setDefaultTemplate(
  id: string,
  workspaceId: string,
  templateType: string
): Promise<TemplateDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  // Unset isDefault on all templates of the same type
  await col.updateMany(
    { workspaceId, template: templateType as any },
    { $set: { isDefault: false } }
  );

  // Set the chosen one as default
  const result = (await col.findOneAndUpdate(
    { _id: id, workspaceId },
    { $set: { isDefault: true, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )) as any;

  const updated = (result?.value ? result.value : result) as TemplateDB | null;
  return updated && isTemplateDb(updated) ? updated : null;
}

/* ========================================================================== */
/*                          TEMPLATE ELEMENT CRUD                             */
/* ========================================================================== */

/**
 * Elements are stored inline in templates.data as PageElement[].
 */

/* ---------- ADD element ---------- */

export async function addTemplateElement(
  templateId: string,
  workspaceId: string,
  input: {
    element: string;
    data?: Record<string, any>;
    name?: string;
    visible?: boolean;
    order?: number;
  }
): Promise<PageElement> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  const tpl = await col.findOne({ _id: templateId, workspaceId });
  if (!tpl) throw new Error('TEMPLATE_NOT_FOUND');

  const existingElements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];

  // Ensure data is an array in DB (templates created before this field may have data as {})
  if (!Array.isArray(tpl.data)) {
    await col.updateOne(
      { _id: templateId, workspaceId },
      { $set: { data: [] } }
    );
  }

  const maxOrder = existingElements.reduce(
    (max, e) => Math.max(max, typeof e.order === 'number' ? e.order : 0),
    0
  );

  const el: PageElement = {
    _id: createDbDocId('tpl-el'),
    element: input.element,
    name: input.name ?? input.element,
    data: input.data ?? {},
    pageId: templateId,
    createdAt: new Date(),
    visible: input.visible ?? true,
    order: typeof input.order === 'number' ? input.order : maxOrder + 1,
  };

  await col.updateOne(
    { _id: templateId, workspaceId },
    {
      $push: { data: el as any },
      $set: { updatedAt: new Date() },
    }
  );

  return el;
}

/* ---------- FETCH elements ---------- */

export async function fetchTemplateElements(
  templateId: string,
  workspaceId: string
): Promise<PageElement[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const tpl = await db
    .collection<TemplateDB>('templates')
    .findOne({ _id: templateId, workspaceId });

  if (!tpl) throw new Error('TEMPLATE_NOT_FOUND');

  const elements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];
  return elements.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/* ---------- UPDATE element ---------- */

export async function updateTemplateElement(
  templateId: string,
  workspaceId: string,
  elementId: string,
  updates: {
    data?: any;
    patch?: { name?: string; visible?: boolean };
  }
): Promise<PageElement | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  const tpl = await col.findOne({ _id: templateId, workspaceId });
  if (!tpl) return null;

  const elements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];
  const idx = elements.findIndex((e) => e._id === elementId);
  if (idx === -1) return null;

  const el = { ...elements[idx] };

  if (updates.data !== undefined) el.data = updates.data;
  if (updates.patch?.name !== undefined) el.name = updates.patch.name;
  if (updates.patch?.visible !== undefined) el.visible = updates.patch.visible;

  elements[idx] = el;

  await col.updateOne(
    { _id: templateId, workspaceId },
    { $set: { data: elements, updatedAt: new Date() } }
  );

  return el;
}

/* ---------- REMOVE element ---------- */

export async function removeTemplateElement(
  templateId: string,
  workspaceId: string,
  elementId: string
): Promise<boolean> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  const tpl = await col.findOne({ _id: templateId, workspaceId });
  if (!tpl) return false;

  const elements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];
  const filtered = elements.filter((e) => e._id !== elementId);

  if (filtered.length === elements.length) return false;

  // resequence
  const resequenced = filtered
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((e, i) => ({ ...e, order: i + 1 }));

  await col.updateOne(
    { _id: templateId, workspaceId },
    { $set: { data: resequenced, updatedAt: new Date() } }
  );

  return true;
}

/* ---------- REORDER elements ---------- */

export async function reorderTemplateElements(
  templateId: string,
  workspaceId: string,
  items: { id: string; order: number }[]
): Promise<{ matched: number; modified: number }> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<TemplateDB>('templates');

  const tpl = await col.findOne({ _id: templateId, workspaceId });
  if (!tpl) throw new Error('TEMPLATE_NOT_FOUND');

  const elements: PageElement[] = Array.isArray(tpl.data) ? tpl.data : [];

  const orderMap = new Map(items.map((it) => [it.id, it.order]));

  const updated = elements.map((e) => {
    const newOrder = orderMap.get(e._id);
    return newOrder !== undefined ? { ...e, order: newOrder } : e;
  });

  updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  await col.updateOne(
    { _id: templateId, workspaceId },
    { $set: { data: updated, updatedAt: new Date() } }
  );

  return { matched: orderMap.size, modified: orderMap.size };
}

// lib/pages/pages.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { PageDB, PageSummary, PageVisibility } from './pages.types';
import { Page } from '@/lib/workspaces/pages/pages.types';
import { PageElement } from './page-elements/page-elements.types';
import { createDbDocId } from '@/utils/createDbDocId';
import { fetchPageElements } from './page-elements/page-elements.repo';

/* ---------- type guard ---------- */

function isPageDb(doc: any): doc is PageDB {
  return (
    doc &&
    typeof doc._id === 'string' &&
    typeof doc.name === 'string' &&
    typeof doc.slug === 'string' &&
    typeof doc.workspaceId === 'string' &&
    doc.createdAt instanceof Date &&
    typeof doc.publishStatus === 'string' &&
    Array.isArray(doc.pageElements)
  );
}

/* ---------- mappers ---------- */

function mapDbToPage(p: PageDB): Page {
  return {
    ...p,
    createdAt: p.createdAt,
    pageElements: [], // Default empty, usually overwritten if populated
  };
}

function mapDbToSummary(p: PageDB): PageSummary {
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    workspaceId: p.workspaceId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    createdBy: p.createdBy,
    updatedBy: p.updatedBy,
    publishStatus: p.publishStatus,
  };
}

/* ---------- INSERT ---------- */

export async function insertPage(data: {
  name: string;
  slug: string;
  workspaceId: string;
  createdBy?: string;
}): Promise<Page> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const page: PageDB = {
    _id: createDbDocId('page'),
    name: data.name,
    slug: data.slug,
    workspaceId: data.workspaceId,
    createdAt: new Date(),
    createdBy: data.createdBy,
    publishStatus: 'offline',
    pageElements: [],
    seo: {},
  };

  await db.collection<PageDB>('pages').insertOne(page);
  return mapDbToPage(page);
}

/* ---------- GET list ---------- */

export async function fetchPages(workspaceId: string): Promise<PageSummary[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const docs = await db
    .collection<PageDB>('pages')
    .find({ workspaceId })
    .toArray();

  return docs.filter(isPageDb).map(mapDbToSummary);
}

/* ---------- GET list (paginated) ---------- */

export type FetchPagesPaginatedParams = {
  workspaceId: string;
  limit?: number;
  skip?: number;
  sortBy?: 'name' | 'slug' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  nameFilter?: string;
  statusFilter?: PageVisibility[];
};

export async function fetchPagesPaginated(
  params: FetchPagesPaginatedParams
): Promise<{ pages: PageSummary[]; total: number }> {
  const {
    workspaceId,
    limit = 10,
    skip = 0,
    sortBy = 'name',
    sortDir = 'asc',
    nameFilter,
    statusFilter,
  } = params;

  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const col = db.collection<PageDB>('pages');

  // Build filter
  const filter: Record<string, any> = { workspaceId };

  if (nameFilter?.trim()) {
    filter.name = { $regex: nameFilter.trim(), $options: 'i' };
  }

  if (statusFilter && statusFilter.length > 0) {
    filter.publishStatus = { $in: statusFilter };
  }

  // Sort direction
  const sortValue = sortDir === 'desc' ? -1 : 1;

  const [docs, total] = await Promise.all([
    col
      .find(filter)
      .sort({ [sortBy]: sortValue })
      .skip(skip)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ]);

  return {
    pages: docs.filter(isPageDb).map(mapDbToSummary),
    total,
  };
}

/* ---------- GET by id ---------- */

export async function fetchPageById(
  id: string,
  workspaceId: string
): Promise<Page | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<PageDB>('pages').findOne({
    _id: id,
    workspaceId,
  });

  if (!isPageDb(raw)) return null;
  if (!isPageDb(raw)) return null;
  
  const page = mapDbToPage(raw);

  // Populate elements
  if (Array.isArray(raw.pageElements) && raw.pageElements.length > 0) {
    const ids = raw.pageElements.map(r => r.id);
    const elements = await fetchPageElements(ids);
    
    // Sort elements based on the ref order (source of truth for order)
    const elementMap = new Map(elements.map(e => [e._id, e]));
    
    page.pageElements = raw.pageElements
      .map(ref => elementMap.get(ref.id))
      .filter((e): e is import('./page-elements/page-elements.types').PageElement => !!e);
  }

  return page;
}

/* ---------- DELETE ---------- */

export async function deletePageById(
  id: string,
  workspaceId: string
): Promise<Page | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<PageDB>('pages').findOne({
    _id: id,
    workspaceId,
  });

  if (!isPageDb(raw)) return null;

  // Delete all associated page elements
  if (Array.isArray(raw.pageElements) && raw.pageElements.length > 0) {
    const elementIds = raw.pageElements.map(ref => ref.id);
    await db.collection<PageElement>('pageElements').deleteMany({ _id: { $in: elementIds } as any });
  }

  await db.collection<PageDB>('pages').deleteOne({
    _id: id,
    workspaceId,
  });

  return mapDbToPage(raw);
}

/* ---------- PATCH publishStatus ---------- */

export async function updatePagePublishStatus(
  pageId: string,
  workspaceId: string,
  publishStatus: PageVisibility,
  userId?: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const setFields: any = { publishStatus, updatedAt: new Date() };
  if (userId) setFields.updatedBy = userId;

  const result = (await db
    .collection<PageDB>('pages')
    .findOneAndUpdate(
      { _id: pageId, workspaceId },
      { $set: setFields },
      { returnDocument: 'after' }
    )) as any;

  // Handle both legacy (ModifyResult) and modern (Document) driver return types
  const updated = (result?.value ? result.value : result) as PageDB | null;

  if (!updated || !isPageDb(updated)) return null;
  return mapDbToPage(updated);
}

/* ---------- PATCH templateIds ---------- */

export async function updatePageTemplateIds(
  pageId: string,
  workspaceId: string,
  templateIds: { headerTemplateId?: string; footerTemplateId?: string },
  userId?: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const setFields: any = { ...templateIds, updatedAt: new Date() };
  if (userId) setFields.updatedBy = userId;

  const result = (await db
    .collection<PageDB>('pages')
    .findOneAndUpdate(
      { _id: pageId, workspaceId },
      { $set: setFields },
      { returnDocument: 'after' }
    )) as any;

  const updated = (result?.value ? result.value : result) as PageDB | null;
  if (!updated || !isPageDb(updated)) return null;
  return mapDbToPage(updated);
}

/* ---------- FIND BY SLUG ---------- */

export async function findPageBySlug(
  slug: string,
  workspaceId: string
): Promise<PageDB | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const raw = await db.collection<PageDB>('pages').findOne({
    slug,
    workspaceId,
  });

  return isPageDb(raw) ? raw : null;
}

/* ---------- INSERT full page (for duplication) ---------- */

export async function insertFullPage(page: PageDB): Promise<Page> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  await db.collection<PageDB>('pages').insertOne(page);
  return mapDbToPage(page);
}

/* ---------- FIND BY TEMPLATE ID ---------- */

export async function fetchPagesByTemplateId(
  workspaceId: string,
  templateId: string
): Promise<PageSummary[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const docs = await db
    .collection<PageDB>('pages')
    .find({
      workspaceId,
      $or: [
        { headerTemplateId: templateId },
        { footerTemplateId: templateId },
      ],
    })
    .toArray();

  return docs.filter(isPageDb).map(mapDbToSummary);
}

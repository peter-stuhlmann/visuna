import { CreatePageInput } from './pages.schema';
import {
  findPageBySlug,
  insertPage,
  fetchPages,
  deletePageById,
  fetchPageById,
  insertFullPage,
  updatePagePublishStatus as repoUpdateStatus,
} from './pages.repo';
import {
  fetchPageElements,
  insertPageElement,
} from './page-elements/page-elements.repo';
import saveLog from '@/components/logs/saveLog';
import { Page, PageDB, PageSummary, PageVisibility, SearchResult } from './pages.types';
import { createDbDocId } from '@/utils/createDbDocId';

/* ---------- helpers ---------- */

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '');
}

function toHref(slug?: string | null): string {
  if (!slug) return '/';
  return `/${slug.replace(/^\/+/, '')}`;
}

function score(q: string, p: PageSummary): number {
  const nq = norm(q);
  const nName = norm(p.name);
  const nSlug = norm(p.slug || '');

  if (!nq) return 0;

  let s = 0;

  if (nSlug.startsWith(nq)) s += 3;
  else if (nSlug.includes(nq)) s += 2;

  if (nName.includes(nq)) s += 2;

  if (p.publishStatus === 'live') s += 2;
  if (p.publishStatus === 'maintenance') s += 1;

  const depth = (p.slug || '').split('/').filter(Boolean).length;
  s += Math.max(0, 3 - depth);

  return s;
}

function toResult(p: PageSummary): SearchResult {
  return {
    id: p._id,
    label: p.name || 'Unbenannte Seite',
    href: toHref(p.slug),
    subtitle: p.slug ? `/${p.slug.replace(/^\/+/, '')}` : undefined,
  };
}

/* ---------- public API ---------- */

export async function createPage(input: CreatePageInput, userId?: string): Promise<Page> {
  const existingPage = await findPageBySlug(input.slug, input.workspaceId);
  if (existingPage) throw new Error('SLUG_EXISTS');

  const page = await insertPage({ ...input, createdBy: userId });
  if (!page) throw new Error('CREATE_FAILED');

  await saveLog({
    workspaceId: input.workspaceId,
    code: '1001',
    action: 'created',
    category: 'page',
    entityType: 'page',
    entityId: page._id,
    entityName: page.name,
    description: `Seite "${page.name}" erstellt.`,
  });
  return page;
}

export async function searchPages(
  workspaceId: string,
  q: string,
  limit: number
): Promise<SearchResult[]> {
  const pages: PageSummary[] = await fetchPages(workspaceId);

  if (!q) {
    return [...pages]
      .sort((a, b) => {
        const order = (s: PageVisibility) =>
          s === 'live' ? 2 : s === 'maintenance' ? 1 : 0;

        const diff = order(b.publishStatus) - order(a.publishStatus);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      })
      .slice(0, limit)
      .map(toResult);
  }

  return pages
    .map((p) => ({ p, s: score(q, p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ p }) => toResult(p));
}

export async function getPageById(
  pageId: string,
  workspaceId: string
): Promise<Page> {
  const page = await fetchPageById(pageId, workspaceId);
  if (!page) throw new Error('NOT_FOUND');
  return page;
}

export async function deletePage(
  pageId: string,
  workspaceId: string
): Promise<Page> {
  const page = await deletePageById(pageId, workspaceId);
  if (!page) throw new Error('NOT_FOUND');

  await saveLog({
    workspaceId,
    code: '1002',
    action: 'deleted',
    category: 'page',
    entityType: 'page',
    entityId: page._id,
    entityName: page.name,
    description: `Seite "${page.name}" gelöscht.`,
  });
  return page;
}

export async function updatePagePublishStatus(
  pageId: string,
  workspaceId: string,
  publishStatus: PageVisibility,
  userId?: string
): Promise<Page> {
  const page = await repoUpdateStatus(pageId, workspaceId, publishStatus, userId);
  if (!page) throw new Error('NOT_FOUND');

  await saveLog({
    workspaceId,
    code: '1004',
    action: 'status_changed',
    category: 'page',
    entityType: 'page',
    entityId: page._id,
    entityName: page.name,
    description: `Publish-Status von "${page.name}" geändert auf "${publishStatus}".`,
    details: {
      newStatus: publishStatus,
      changes: [
        { field: 'Publish-Status', from: '–', to: publishStatus },
      ],
    },
  });
  return page;
}

export async function duplicatePage(
  pageId: string,
  workspaceId: string
): Promise<Page> {
  // 1. Fetch the raw page (includes seo + pageElement refs)
  const original = await fetchPageById(pageId, workspaceId);
  if (!original) throw new Error('NOT_FOUND');

  // 2. Build unique slug with number suffix (-2, -3, ...)
  const originalSlug = original.slug || 'seite';
  // Strip any existing trailing number suffix (e.g. "test-2" → "test")
  const baseSlug = originalSlug.replace(/-\d+$/, '');
  let newSlug = `${baseSlug}-2`;
  let counter = 2;
  while (await findPageBySlug(newSlug, workspaceId)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  // 3. Duplicate page elements
  const oldElementIds = (original.pageElements || []).map((e: any) => e._id || e.id);
  const oldElements = oldElementIds.length > 0 ? await fetchPageElements(oldElementIds) : [];

  const newPageId = createDbDocId('page');
  const newElementRefs: { id: string; order?: number }[] = [];

  for (const el of oldElements) {
    const newElId = await insertPageElement({
      pageId: newPageId,
      data: el.data,
      order: el.order,
      element: el.element,
      visible: el.visible,
      name: el.name,
      createdAt: new Date(),
    });
    newElementRefs.push({ id: newElId, order: el.order });
  }

  // 4. Build new page document
  const newPageDoc: PageDB = {
    _id: newPageId,
    name: `DUPLIKAT von ${original.name}`,
    slug: newSlug,
    workspaceId,
    createdAt: new Date(),
    publishStatus: 'offline',
    seo: original.seo ?? {},
    pageElements: newElementRefs,
  };

  const newPage = await insertFullPage(newPageDoc);

  await saveLog({
    workspaceId,
    code: '1003',
    action: 'duplicated',
    category: 'page',
    entityType: 'page',
    entityId: newPageDoc._id,
    entityName: newPageDoc.name,
    description: `Seite "${original.name}" dupliziert zu "${newPageDoc.name}".`,
    details: { sourceId: original._id, sourceName: original.name },
  });

  return newPage;
}

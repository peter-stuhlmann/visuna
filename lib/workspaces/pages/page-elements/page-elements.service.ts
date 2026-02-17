// lib/workspaces/pages/page-elements/page-elements.service.ts
import {
  deletePageElementDoc, // <- FEHLTE
  removePageElementRef,
  resequencePageElements,
  updatePageElementsOrder,
  reorderPageElementRefs,
  insertPageElement,
  pushPageElementRef,
  updateElementOrder,
  getPageById,
} from './page-elements.repo';
import { PageElement } from './page-elements.types';
import saveLog from '@/components/logs/saveLog';

type IncomingItem = { id: string; order: number };

type CreateInput = {
  workspaceId: string;
  pageId: string;
  element: string;
  data?: Record<string, any>;
  name?: string;
  visible?: boolean;
  order?: number;
};

/* ---------------- DELETE ---------------- */

export async function deletePageElement(input: {
  workspaceId: string;
  pageId: string;
  elementId: string;
}) {
  const { pageId, elementId } = input;

  // 1. Dokument löschen
  const deleted = await deletePageElementDoc(elementId);
  if (!deleted) return null;

  // 2. Referenz aus Page entfernen
  const pageUpdate = await removePageElementRef(pageId, elementId);

  // 3. Reihenfolge neu setzen
  await resequencePageElements(pageId);

  await saveLog({
    workspaceId: input.workspaceId,
    code: '1202',
    action: 'deleted',
    category: 'page_element',
    entityType: 'page_element',
    entityId: elementId,
    description: `Seitenelement "${elementId}" gelöscht.`,
    details: { pageId },
  });

  return {
    deletedElementId: elementId,
    pageModified: pageUpdate,
  };
}

/* ---------------- REORDER ---------------- */

function isStringId(s: unknown): s is string {
  return typeof s === 'string' && s.length > 0;
}

export async function reorderPageElements(
  pageId: string,
  items: { id: string; order: number }[],
  workspaceId?: string
) {
  const idOrder = new Map<string, number>();

  for (const it of items) {
    if (typeof it.id === 'string') {
      idOrder.set(it.id, Number(it.order) || 0);
    }
  }

  if (idOrder.size === 0) {
    throw new Error('NO_VALID_ITEMS');
  }

  const peRes = await updatePageElementsOrder(idOrder);
  const pageRes = await reorderPageElementRefs(pageId, idOrder);

  if (workspaceId) {
    await saveLog({
      workspaceId,
      code: '1203',
      action: 'updated',
      category: 'page_element',
      entityType: 'page_element',
      description: `${idOrder.size} Seitenelemente umsortiert.`,
      details: { pageId, count: idOrder.size },
    });
  }

  return {
    peMatched: peRes.matched,
    peModified: peRes.modified,
    pageMatched: pageRes.matched,
    pageModified: pageRes.modified,
  };
}

/* ---------------- CREATE ---------------- */

export async function createPageElement(input: CreateInput) {
  const { pageId, element, data = {}, name, visible = false } = input;

  if (!pageId || !element) {
    throw new Error('VALIDATION_ERROR');
  }

  const page = await getPageById(pageId);
  if (!page) {
    throw new Error('PAGE_NOT_FOUND');
  }

  // Order bestimmen
  const nextOrder =
    typeof input.order === 'number'
      ? input.order
      : (() => {
          let max = 0;
          if (page.pageElements?.length) {
            max = Math.max(
              ...page.pageElements.map((r) =>
                typeof r.order === 'number' ? r.order : 0
              )
            );
          }
          return max + 1;
        })();

  const newElement: Omit<PageElement, '_id'> = {
    element,
    name: name ?? element,
    data,
    pageId,
    createdAt: new Date(),
    visible,
    order: nextOrder,
  };

  const id = await insertPageElement(newElement);

  await pushPageElementRef(pageId, id, nextOrder);
  await updateElementOrder(id, nextOrder);

  if (input.workspaceId) {
    await saveLog({
      workspaceId: input.workspaceId,
      code: '1201',
      action: 'created',
      category: 'page_element',
      entityType: 'page_element',
      entityId: id,
      entityName: name ?? element,
      description: `Seitenelement "${name ?? element}" hinzugefügt.`,
      details: { pageId, element },
    });
  }

  return {
    ...newElement,
    _id: id,
  };
}

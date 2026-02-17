// lib/workspaces/pages/page-elements/page-elements.repo.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { PageDB } from '../pages.types';
import { PageElement, PageElementRef } from './page-elements.types';
import { PageElementData } from '@/components/content-elements/default/types';
import { ObjectId } from 'mongodb';
import { createDbDocId } from '@/utils/createDbDocId';

/* ---------- helper ---------- */
function getQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { _id: new ObjectId(id) }] };
  }
  return { _id: id };
}

type MetaPatch = {
  name?: string;
  visible?: boolean;
};

/* ---------- fetch by IDs ---------- */

export async function fetchPageElements(ids: string[]): Promise<PageElement[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  // Filter out any potential non-string/invalid IDs if mixed types exist, 
  // but assuming stable usage here.
  const docs = await db
    .collection<PageElement>('pageElements')
    .find({ _id: { $in: ids } })
    .toArray();
  
  return docs;
}

/* ---------- delete element doc ---------- */

export async function deletePageElementDoc(pageElementId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const res = await db
    .collection<PageElement>('pageElements')
    .deleteOne(getQuery(pageElementId));

  return res.deletedCount === 1;
}

/* ---------- remove ref from page ---------- */

export async function removePageElementRef(
  pageId: string,
  pageElementId: string
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const res = await db.collection<PageDB>('pages').updateOne(
    { _id: pageId },
    {
      $pull: {
        pageElements: { id: pageElementId },
      },
    }
  );

  return res.modifiedCount === 1;
}

/* ---------- resequence ---------- */

export async function resequencePageElements(pageId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const page = await db.collection<PageDB>('pages').findOne({ _id: pageId });
  if (!page || !Array.isArray(page.pageElements)) return;

  const resequenced: PageElementRef[] = page.pageElements
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((r, idx) => ({
      id: r.id,
      order: idx + 1,
    }));

  await db
    .collection<PageDB>('pages')
    .updateOne({ _id: pageId }, { $set: { pageElements: resequenced } });
}

/* ---------- UPDATE PAGE ELEMENT ---------- */

export async function updatePageElement(
  pageElementId: string,
  data?: PageElementData,
  patch?: MetaPatch
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const peCol = db.collection<PageElement>('pageElements');

  const $set: Record<string, unknown> = {};

  if (data && typeof data === 'object') {
    $set.data = data;
  }

  if (patch) {
    if (patch.name !== undefined) {
      if (typeof patch.name !== 'string') {
        throw new Error('name must be string');
      }
      $set.name = patch.name;
    }

    if (patch.visible !== undefined) {
      if (typeof patch.visible !== 'boolean') {
        throw new Error('visible must be boolean');
      }
      $set.visible = patch.visible;
    }
  }

  if (Object.keys($set).length === 0) {
    return { matched: 0, modified: 0 };
  }

  const result = (await peCol.findOneAndUpdate(
    getQuery(pageElementId),
    { $set },
    { returnDocument: 'after' }
  )) as any;

  // Handle both legacy (ModifyResult) and modern (Document) driver return types
  const updated = (result?.value ? result.value : result) as PageElement | null;

  return updated;
}

/* ---------- update element order ---------- */

export async function updatePageElementsOrder(idOrder: Map<string, number>) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const peCol = db.collection<PageElement>('pageElements');

  // Note: BulkWrite for legacy IDs is complex. Assuming drag & drop mainly affects modern string IDs or verified existing ones.
  // For safety, we keep simple string match here, or rewrite bulk ops.
  // Given mixed mode, bulkWrite with $or is not possible per op in simple map logic.
  // Falling back to single updates if bulk fails? No, bulk is efficient.
  // Optimization: Verify IDs. But for now, let's assume Order Updates mostly happen on new elements or we accepted that legacy elements might need migration for complex drag drop if this fails.
  // However, `getQuery` logic can be applied if we iterate.

  const ops = [...idOrder.entries()].map(([id, order]) => ({
    updateOne: {
      filter: getQuery(id),
      update: { $set: { order } },
    },
  }));

  if (ops.length === 0) return { matched: 0, modified: 0 };

  const res = await peCol.bulkWrite(ops, { ordered: false });

  return {
    matched: res.matchedCount ?? 0,
    modified: res.modifiedCount ?? 0,
  };
}

/* ---------- reorder page refs ---------- */

export async function reorderPageElementRefs(
  pageId: string,
  idOrder: Map<string, number>
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  const pagesCol = db.collection<PageDB>('pages');

  const page = await pagesCol.findOne({ _id: pageId });
  if (!page || !Array.isArray(page.pageElements)) {
    return { matched: 0, modified: 0 };
  }

  const currentIds = page.pageElements.map((r) => r.id);

  const known = currentIds
    .filter((id) => idOrder.has(id))
    .sort((a, b) => idOrder.get(a)! - idOrder.get(b)!);

  const unknown = currentIds.filter((id) => !idOrder.has(id));
  const merged = [...known, ...unknown];

  const nextRefs: PageElementRef[] = merged.map((id, idx) => ({
    id,
    order: idOrder.get(id) ?? idx + 1,
  }));

  const res = await pagesCol.updateOne(
    { _id: pageId },
    { $set: { pageElements: nextRefs } }
  );

  return {
    matched: res.matchedCount,
    modified: res.modifiedCount,
  };
}

/* ---------- insert element ---------- */

export async function insertPageElement(
  data: Omit<PageElement, '_id'>
): Promise<string> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const _id = createDbDocId('page-element');

  await db
    .collection<PageElement>('pageElements')
    .insertOne({ ...data, _id } as PageElement);

  return _id;
}

/* ---------- get page ---------- */

export async function getPageById(pageId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);
  return db.collection<PageDB>('pages').findOne({ _id: pageId });
}

/* ---------- push ref ---------- */

export async function pushPageElementRef(
  pageId: string,
  pageElementId: string,
  order: number
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db.collection<PageDB>('pages').updateOne(
    { _id: pageId },
    {
      $push: {
        pageElements: {
          id: pageElementId,
          order,
        },
      },
    }
  );
}

/* ---------- update order on element ---------- */

export async function updateElementOrder(pageElementId: string, order: number) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  await db
    .collection<PageElement>('pageElements')
    .updateOne(getQuery(pageElementId), { $set: { order } });
}

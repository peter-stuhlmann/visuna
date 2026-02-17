import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import { Page, PageDB } from '@/lib/workspaces/pages/pages.types';
import connectToDatabase from '@/utils/connectToDatabase';

export const getPage = async (pageId: string): Promise<Page | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  const pagesCol = db.collection<PageDB>('pages');
  const peCol = db.collection<PageElement>('pageElements');

  try {
    if (!pageId) return null;

    const page = await pagesCol.findOne({ _id: pageId });
    if (!page) return null;

    const orderMap = new Map<string, number>();
    for (const ref of page.pageElements ?? []) {
      if (ref?.id) {
        orderMap.set(ref.id, ref.order ?? orderMap.size + 1);
      }
    }

    const ids = [...orderMap.keys()];
    let elementDocs: PageElement[] = [];

    if (ids.length > 0) {
      elementDocs = await peCol.find({ _id: { $in: ids } }).toArray();
    }

    elementDocs.sort((a, b) => {
      const oa = orderMap.get(a._id) ?? Number.MAX_SAFE_INTEGER;
      const ob = orderMap.get(b._id) ?? Number.MAX_SAFE_INTEGER;
      return oa - ob;
    });

    const serializedElements: PageElement[] = elementDocs.map((el) => ({
      ...el,
      order: orderMap.get(el._id) ?? 0,
      data: JSON.parse(JSON.stringify(el.data ?? {})),
    }));

    return {
      ...page,
      pageElements: serializedElements,
      publishStatus: page.publishStatus ?? 'offline',
      seo: page.seo ?? {},
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
};

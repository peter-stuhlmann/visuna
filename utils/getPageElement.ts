import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { notFound } from 'next/navigation';

export async function getPageElement(id: string): Promise<PageElement | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pageElementsCollection = db.collection<PageElement>('pageElements');

  const doc = await pageElementsCollection.findOne({ _id: id });

  if (!doc) return notFound();

  const pageElement = {
    ...doc,
    _id: doc._id,
    pageId: doc.pageId,
    name: doc.name,
    element: doc.element,
    data: doc.data ?? {},
    order: doc.order ?? 0,
    visible: doc.visible,
    createdAt: doc.createdAt,
  };

  return pageElement;
}

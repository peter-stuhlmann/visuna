import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';
import { PageElement } from '@/components/content-elements/default/types';
import { notFound } from 'next/navigation';

export async function getPageElement(id: string): Promise<PageElement | null> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pageElementsCollection = db.collection('pageElements');

  if (!ObjectId.isValid(id)) {
    console.warn('[getPageElement] Ungültige ID:', id);
    return null;
  }
  const doc = await pageElementsCollection.findOne({ _id: new ObjectId(id) });

  if (!doc) return notFound();

  const pageElement = {
    ...doc,
    _id: doc._id.toString(),
    pageId: doc.pageId?.toString?.() ?? '',
    name: doc.name,
    element: doc.element,
    data: doc.data ?? {},
    order: doc.order ?? 0,
  };

  return pageElement;
}

import { DBPageElement } from '@/components/content-elements/default/types';
import { Page, DBPage } from '@/components/pages/Pages.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';

export const getPage = async (pageId: string): Promise<Page | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<DBPage>('pages');
  const pageElementsCollection = db.collection<DBPageElement>('pageElements');

  try {
    if (!pageId) return null;

    const pageObjectId = new ObjectId(pageId);
    const page = await collection.findOne({ _id: pageObjectId });

    if (!page) return null;

    // Hole alle referenzierten PageElements
    const elementDocs = await pageElementsCollection
      .find({ _id: { $in: page.pageElements } })
      .toArray();

    // Serialisiere alles sauber
    const serializedElements = elementDocs.map((el) => ({
      ...el,
      _id: el._id.toString(),
      pageId: el.pageId?.toString?.() ?? '',
      data: JSON.parse(JSON.stringify(el.data ?? {})),
      order: el.order ?? 0, // 👈 Standardwert sicherstellen
    }));

    const formattedPage: Page = {
      _id: page._id.toString(),
      name: page.name,
      slug: page.slug,
      createdAt: page.createdAt,
      published: page.published,
      pageElements: serializedElements,
    };

    return formattedPage;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

import { PageElement } from '@/components/content-elements/default/types';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';

export type PageData = {
  pageExists: boolean;
  pageElements: PageElement[];
};

const getPage = async (slug: string): Promise<PageData> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection('pages');
  const pageElementsCollection = db.collection('pageElements');

  try {
    if (!slug) {
      console.error('No slug provided');
      return { pageExists: false, pageElements: [] };
    }

    const page = await pagesCollection.findOne({ slug });

    if (!page || !page.published) {
      console.error('Page not found or unpublished');
      return { pageExists: false, pageElements: [] };
    }

    // Hole die IDs aus dem pages-Dokument
    const elementIds = (page.pageElements ?? []).map(
      (id: string) => new ObjectId(id)
    );

    // Hole alle referenzierten PageElements
    const elements = await pageElementsCollection
      .find({ _id: { $in: elementIds } })
      .toArray();

    // Serialisiere sie sauber
    const serializedElements: PageElement[] = elements
      .map((el) => ({
        _id: el._id.toString(),
        pageId: el.pageId?.toString?.() ?? '',
        name: el.name ?? '', // falls optional – sonst anpassen!
        element: el.element ?? '',
        data: JSON.parse(JSON.stringify(el.data ?? {})),
        order: el.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order);

    return { pageExists: true, pageElements: serializedElements };
  } catch (error) {
    console.error('Error fetching page or elements:', error);
    return { pageExists: false, pageElements: [] };
  }
};

export default getPage;

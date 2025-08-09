import { Page } from '@/components/pages/Pages.types';
import connectToDatabase from '@/utils/connectToDatabase';

export const getPages = async (): Promise<Page[] | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection('pages');

  try {
    const pages = await collection.find({}).toArray();

    if (pages.length > 0) {
      const formattedPage = pages.map((form) => ({
        _id: form._id.toString(),
        slug: form.slug,
        name: form.name || 'Unbenannte Seite',
        createdAt: form.createdAt || new Date().toISOString(),
        published: form.published || false,
      }));

      return formattedPage as Page[];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

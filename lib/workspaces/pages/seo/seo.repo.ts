import connectToDatabase from '@/utils/connectToDatabase';
import { SeoData } from './seo.types';
import { PageDB } from '../pages.types';

export async function fetchSeoByPageId(pageId: string): Promise<SeoData> {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const page = await db
    .collection<PageDB>('pages')
    .findOne({ _id: pageId }, { projection: { seo: 1 } });

  if (!page || typeof page !== 'object') {
    throw new Error('NOT_FOUND');
  }

  return (page as PageDB).seo ?? {};
}

export async function updateSeoByPageId(pageId: string, seo: SeoData) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const result = await db.collection<PageDB>('pages').updateOne(
    { _id: pageId },
    {
      $set: {
        seo,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('NOT_FOUND');
  }
}

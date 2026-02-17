import { PageVisibility } from '@/lib/workspaces/pages/pages.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { getRequestContext } from '@/utils/getRequestContext';

type LocalizedString = Record<string, string>;

export type SeoData = {
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
};

type Result = {
  pageExists: boolean;
  seo: SeoData | null;
  publishStatus?: PageVisibility;
};

export default async function getPageSeo(slug: string): Promise<Result> {
  const { workspaceId } = await getRequestContext();

  if (!workspaceId || !slug) {
    console.error('[getPageSeo] Missing workspaceId or slug', {
      workspaceId,
      slug,
    });
    return { pageExists: false, seo: null };
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection('pages');

  const page = await pagesCollection.findOne(
    {
      workspaceId: workspaceId,
      slug,
    },
    {
      projection: {
        seo: 1,
        publishStatus: 1,
      },
    }
  );

  if (!page) {
    return { pageExists: false, seo: null };
  }

  // 🔥 sauberer 3-State-Fallback
  const publishStatus: PageVisibility =
    (page as any).publishStatus ?? 'offline';

  const seo = (page as { seo?: SeoData }).seo ?? null;

  return {
    pageExists: true,
    seo,
    publishStatus,
  };
}

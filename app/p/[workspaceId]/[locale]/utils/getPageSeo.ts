import connectToDatabase from '@/utils/connectToDatabase';
import { PageDB, PageVisibility } from '@/lib/workspaces/pages/pages.types';

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

export default async function getPageSeo(
  workspaceId: string,
  slug: string
): Promise<Result> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection<PageDB>('pages');

  if (!workspaceId || !slug) {
    return { pageExists: false, seo: null };
  }

  const page = await pagesCollection.findOne(
    {
      workspaceId,
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

  const publishStatus = (page as any).publishStatus as
    | PageVisibility
    | undefined;

  const seo = (page as { seo?: SeoData }).seo ?? null;

  return {
    pageExists: true,
    seo,
    publishStatus,
  };
}

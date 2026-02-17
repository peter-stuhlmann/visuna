import connectToDatabase from '@/utils/connectToDatabase';
import { getRequestContext } from '@/utils/getRequestContext';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import {
  Page,
  PageDB,
  PageVisibility,
} from '@/lib/workspaces/pages/pages.types';

/* -----------------------------
   Types
----------------------------- */

export type LocalizedString = Record<string, string>;

export type SeoData = {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;

  ogTitle: LocalizedString;
  ogDescription: LocalizedString;
  ogImage: LocalizedString;
  ogImageAlt: LocalizedString;

  twitterCard: LocalizedString;
  twitterTitle: LocalizedString;
  twitterDescription: LocalizedString;
  twitterImage: LocalizedString;
  twitterImageAlt: LocalizedString;

  canonicalUrl: LocalizedString;
  robots: LocalizedString;

  ogUrl: LocalizedString;
  ogType: LocalizedString;
  ogSiteName: LocalizedString;
};

export type PageData = {
  pageExists: boolean;
  pageElements: PageElement[];
  seo: SeoData | null;
  publishStatus?: PageVisibility;
};

/* -----------------------------
   Helpers
----------------------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceLocalizedString(v: unknown): LocalizedString {
  if (!isRecord(v)) return {};
  const out: LocalizedString = {};
  for (const [lang, val] of Object.entries(v)) {
    if (typeof val === 'string' && val.length) {
      out[lang] = val;
    }
  }
  return out;
}

const SEO_KEYS: (keyof SeoData)[] = [
  'metaTitle',
  'metaDescription',
  'ogTitle',
  'ogDescription',
  'ogImage',
  'ogImageAlt',
  'twitterCard',
  'twitterTitle',
  'twitterDescription',
  'twitterImage',
  'twitterImageAlt',
  'canonicalUrl',
  'robots',
  'ogUrl',
  'ogType',
  'ogSiteName',
];

function coerceSeo(input: unknown): SeoData | null {
  if (!isRecord(input)) return null;

  const base: SeoData = {
    metaTitle: {},
    metaDescription: {},
    ogTitle: {},
    ogDescription: {},
    ogImage: {},
    ogImageAlt: {},
    twitterCard: {},
    twitterTitle: {},
    twitterDescription: {},
    twitterImage: {},
    twitterImageAlt: {},
    canonicalUrl: {},
    robots: {},
    ogUrl: {},
    ogType: {},
    ogSiteName: {},
  };

  const next: SeoData = { ...base };
  for (const key of SEO_KEYS) {
    next[key] = coerceLocalizedString(input[key]);
  }

  return next;
}

/* -----------------------------
   MAIN FUNCTION
----------------------------- */

const getPage = async (slug: string): Promise<PageData> => {
  const { workspaceId } = await getRequestContext();

  if (!workspaceId || !slug) {
    return { pageExists: false, pageElements: [], seo: null };
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection<PageDB>('pages');
  const pageElementsCollection = db.collection<PageElement>('pageElements');

  try {
    const page = await pagesCollection.findOne(
      { workspaceId, slug },
      {
        projection: {
          pageElements: 1,
          seo: 1,
          publishStatus: 1,
        },
      }
    );

    if (!page) {
      return { pageExists: false, pageElements: [], seo: null };
    }

    const publishStatus = page.publishStatus ?? 'offline';
    const seo = coerceSeo((page as any).seo);

    const rawRefs = Array.isArray(page.pageElements) ? page.pageElements : [];

    // Map: elementId -> order
    const orderMap = new Map<string, number>();

    for (const ref of rawRefs) {
      if (ref?.id) {
        orderMap.set(
          ref.id,
          typeof ref.order === 'number' ? ref.order : orderMap.size + 1
        );
      }
    }

    const ids = [...orderMap.keys()];

    if (ids.length === 0) {
      return { pageExists: true, pageElements: [], seo, publishStatus };
    }

    const elements = await pageElementsCollection
      .find({ _id: { $in: ids } })
      .toArray();

    const serialized: PageElement[] = elements.map((el) => ({
      ...el,
      order: orderMap.get(el._id) ?? 0,
      data: JSON.parse(JSON.stringify(el.data ?? {})),
    }));

    serialized.sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      return ao !== bo ? ao - bo : a._id.localeCompare(b._id);
    });

    return {
      pageExists: true,
      pageElements: serialized,
      seo,
      publishStatus,
    };
  } catch (error) {
    console.error('[getPage] Error fetching page:', error);
    return { pageExists: false, pageElements: [], seo: null };
  }
};

export default getPage;

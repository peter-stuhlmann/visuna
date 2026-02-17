import connectToDatabase from '@/utils/connectToDatabase';
import { PageDB, PageVisibility } from '@/lib/workspaces/pages/pages.types';
import {
  PageElement,
  PageElementRef,
} from '@/lib/workspaces/pages/page-elements/page-elements.types';

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

/* -----------------------------
   Helpers
----------------------------- */

type PageRefLoose = string | PageElementRef;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceLocalizedString(v: unknown): LocalizedString {
  if (!isRecord(v)) return {};
  const out: LocalizedString = {};
  for (const [lang, val] of Object.entries(v)) {
    if (typeof val === 'string' && val.length) out[lang] = val;
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
    next[key] = coerceLocalizedString(
      (input as Record<string, unknown>)[key as string]
    );
  }

  return next;
}

/* -----------------------------
   MAIN
----------------------------- */

const getPage = async (
  workspaceId: string,
  slug: string
): Promise<{
  pageExists: boolean;
  pageElements: PageElement[];
  seo: SeoData | null;
  publishStatus: PageVisibility;
}> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pagesCollection = db.collection<PageDB>('pages');
  const pageElementsCollection = db.collection<PageElement>('pageElements');

  if (!workspaceId || !slug) {
    return {
      pageExists: false,
      pageElements: [],
      seo: null,
      publishStatus: 'offline',
    };
  }

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
    return {
      pageExists: false,
      pageElements: [],
      seo: null,
      publishStatus: 'offline',
    };
  }

  const publishStatus: PageVisibility =
    (page as any).publishStatus ?? 'offline';

  // Offline → wie 404 behandeln
  if (publishStatus === 'offline') {
    return {
      pageExists: false,
      pageElements: [],
      seo: null,
      publishStatus,
    };
  }

  const seo = coerceSeo((page as Record<string, unknown>).seo);

  const rawRefs: PageRefLoose[] = Array.isArray(page.pageElements)
    ? (page.pageElements as PageRefLoose[])
    : [];

  // Map: id -> order
  const orderMap = new Map<string, number | undefined>();
  for (const ref of rawRefs) {
    if (typeof ref === 'object' && ref !== null && 'id' in ref) {
      const id = String((ref as any).id || '');
      if (id) orderMap.set(id, (ref as any).order);
    } else if (typeof ref === 'string') {
      orderMap.set(ref, undefined);
    }
  }

  const ids = [...orderMap.keys()];

  const elements =
    ids.length === 0
      ? []
      : await pageElementsCollection.find({ _id: { $in: ids } }).toArray();

  const serialized: PageElement[] = elements.map((el) => {
    const refOrder = orderMap.get(el._id);

    return {
      _id: el._id,
      pageId: el.pageId ?? '',
      name: el.name ?? el.element ?? '',
      element: el.element ?? '',
      data: JSON.parse(JSON.stringify(el.data ?? {})),
      createdAt: el.createdAt ?? undefined,
      order:
        typeof refOrder === 'number'
          ? refOrder
          : typeof el.order === 'number'
            ? el.order
            : 0,
      visible: el.visible ?? false,
    };
  });

  serialized.sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a._id.localeCompare(b._id)
  );

  return {
    pageExists: true,
    pageElements: serialized,
    seo,
    publishStatus,
  };
};

export default getPage;

// app/(frontend)/[...irgendwo]/utils/getPage.ts
import connectToDatabase from '@/utils/connectToDatabase';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

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
  publishStatus: PageVisibility;
  headerTemplateId?: string;
  footerTemplateId?: string;
};

// -----------------------------
// helpers
// -----------------------------

type PageRefLoose = string | { id: string; order?: number | null | undefined };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceLocalizedString(v: unknown): LocalizedString {
  if (!isRecord(v)) return {};
  const out: LocalizedString = {};
  for (const [k, v2] of Object.entries(v)) {
    if (typeof v2 === 'string' && v2.length) out[k] = v2;
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

  const out: SeoData = { ...base };
  for (const k of SEO_KEYS) {
    out[k] = coerceLocalizedString((input as any)[k]);
  }
  return out;
}

// -----------------------------
// MAIN
// -----------------------------

const getPage = async (
  workspaceId: string,
  slug: string
): Promise<PageData> => {
  if (!workspaceId || !slug) {
    return {
      pageExists: false,
      pageElements: [],
      seo: null,
      publishStatus: 'offline',
    };
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const pages = db.collection('pages');
  const elements = db.collection<PageElement>('pageElements');

  const page = await pages.findOne(
    {
      workspaceId,
      slug,
    },
    {
      projection: {
        pageElements: 1,
        seo: 1,
        publishStatus: 1,
        headerTemplateId: 1,
        footerTemplateId: 1,
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

  const publishStatus: PageVisibility = page.publishStatus ?? 'offline';
  const seo = coerceSeo((page as any).seo);

  if (publishStatus === 'offline') {
    return {
      pageExists: true,
      pageElements: [],
      seo,
      publishStatus,
    };
  }

  const rawRefs: PageRefLoose[] = Array.isArray(page.pageElements)
    ? page.pageElements
    : [];

  const orderMap = new Map<string, number | undefined>();
  for (const ref of rawRefs) {
    if (typeof ref === 'object' && ref !== null && 'id' in ref) {
      if (typeof ref.id === 'string') {
        orderMap.set(ref.id, ref.order ?? undefined);
      }
    } else if (typeof ref === 'string') {
      orderMap.set(ref, undefined);
    }
  }

  const ids = [...orderMap.keys()];

  const els = await elements.find({ _id: { $in: ids } }).toArray();

  const serialized: PageElement[] = els.map((el) => ({
    ...el,
    _id: el._id, // already string
    data: JSON.parse(JSON.stringify(el.data ?? {})),
    order: orderMap.get(el._id) ?? el.order ?? 0,
    visible: el.visible ?? false,
  }));

  serialized.sort((a, b) => a.order - b.order);

  return {
    pageExists: true,
    pageElements: serialized,
    seo,
    publishStatus,
    headerTemplateId: (page as any).headerTemplateId || undefined,
    footerTemplateId: (page as any).footerTemplateId || undefined,
  };
};

export default getPage;

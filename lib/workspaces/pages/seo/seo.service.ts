import { SeoData, LocalizedString } from './seo.types';
import { fetchSeoByPageId, updateSeoByPageId } from './seo.repo';
import saveLog from '@/components/logs/saveLog';

/* ---------- helpers ---------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function coerceLocalizedString(v: unknown): LocalizedString {
  if (!isRecord(v)) return {};
  const out: LocalizedString = {};

  for (const [lang, val] of Object.entries(v)) {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed) out[lang] = trimmed;
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

export function coerceSeo(input: unknown): SeoData {
  const base = {
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
  } satisfies SeoData;

  if (!isRecord(input)) return base;

  const next: SeoData = { ...base };

  for (const key of SEO_KEYS) {
    next[key] = coerceLocalizedString(input[key as string]);
  }

  return next;
}

/* ---------- public API ---------- */

export async function getSeo(
  pageId: string,
  _workspaceId?: string
): Promise<SeoData> {
  return fetchSeoByPageId(pageId);
}

export async function saveSeo(
  pageId: string,
  seoRaw: unknown,
  workspaceId: string
): Promise<void> {
  const seo = coerceSeo(seoRaw);

  await updateSeoByPageId(pageId, seo);

  await saveLog({
    workspaceId,
    code: '1801',
    action: 'updated',
    category: 'seo',
    entityType: 'page',
    entityId: pageId,
    description: `SEO-Daten für Seite ${pageId} gespeichert.`,
  });
}

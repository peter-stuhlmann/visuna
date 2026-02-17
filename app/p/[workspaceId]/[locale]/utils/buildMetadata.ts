// app/[locale]/[slug]/utils/buildMetadata.ts
import type { Metadata } from 'next';
import type { LanguageCode } from '@/components/language-settings/languages';

type LocalizedString = Record<string, string>;

export type SeoData = {
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;

  ogTitle?: LocalizedString;
  ogDescription?: LocalizedString;
  ogImage?: LocalizedString;
  ogImageAlt?: LocalizedString;

  twitterCard?: LocalizedString;
  twitterTitle?: LocalizedString;
  twitterDescription?: LocalizedString;
  twitterImage?: LocalizedString;
  twitterImageAlt?: LocalizedString;

  canonicalUrl?: LocalizedString;
  robots?: LocalizedString;

  ogUrl?: LocalizedString;
  ogType?: LocalizedString;
  ogSiteName?: LocalizedString;
};

type BuildMetadataParams = {
  seo: SeoData | null | undefined;

  // aktuelle Sprache aus /[locale]
  lang: LanguageCode;

  // Fallbacks, wenn nichts gesetzt ist
  fallbackTitle?: string;
  fallbackDescription?: string;

  /**
   * Optional: Basis-URL, falls du relative URLs ("/img.png") in absolut wandeln willst.
   * Beispiel: "https://example.com"
   */
  siteUrl?: string;
};

function clean(s: unknown): string | undefined {
  if (typeof s !== 'string') return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

function pickLocalized(map: LocalizedString | undefined, lang: LanguageCode) {
  if (!map) return undefined;
  // bewusst nur lang (kein "mainLang" mehr nötig, weil locale die Wahrheit ist)
  return clean(map[lang]) ?? undefined;
}

function toAbsoluteUrl(maybeUrl: string | undefined, siteUrl?: string) {
  const u = clean(maybeUrl);
  if (!u) return undefined;

  // schon absolut?
  if (/^https?:\/\//i.test(u)) return u;

  // relative -> wenn siteUrl vorhanden, absolut machen
  const base = clean(siteUrl);
  if (!base) return u;

  try {
    return new URL(u, base.endsWith('/') ? base : `${base}/`).toString();
  } catch {
    return u;
  }
}

export function buildMetadata({
  seo,
  lang,
  fallbackTitle = 'Startseite',
  fallbackDescription = 'Startseite',
  siteUrl,
}: BuildMetadataParams): Metadata {
  // --------
  // Defaults
  // --------
  if (!seo) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  // -------------------------
  // Title / Description
  // -------------------------
  const title =
    pickLocalized(seo.metaTitle, lang) ??
    pickLocalized(seo.ogTitle, lang) ??
    pickLocalized(seo.twitterTitle, lang) ??
    fallbackTitle;

  const description =
    pickLocalized(seo.metaDescription, lang) ??
    pickLocalized(seo.ogDescription, lang) ??
    pickLocalized(seo.twitterDescription, lang) ??
    fallbackDescription;

  // -------------------------
  // Canonical / Robots
  // -------------------------
  const canonical = toAbsoluteUrl(
    pickLocalized(seo.canonicalUrl, lang),
    siteUrl
  );
  const robots = pickLocalized(seo.robots, lang);

  // -------------------------
  // OpenGraph
  // -------------------------
  const ogTitle = pickLocalized(seo.ogTitle, lang) ?? title;
  const ogDescription = pickLocalized(seo.ogDescription, lang) ?? description;

  const ogType = pickLocalized(seo.ogType, lang) ?? 'website';
  const ogSiteName = pickLocalized(seo.ogSiteName, lang);

  const ogUrl = toAbsoluteUrl(pickLocalized(seo.ogUrl, lang), siteUrl);

  const ogImage = toAbsoluteUrl(pickLocalized(seo.ogImage, lang), siteUrl);
  const ogImageAlt = pickLocalized(seo.ogImageAlt, lang);

  // -------------------------
  // Twitter
  // -------------------------
  const twitterCard =
    pickLocalized(seo.twitterCard, lang) ?? 'summary_large_image';
  const twitterTitle = pickLocalized(seo.twitterTitle, lang) ?? title;
  const twitterDescription =
    pickLocalized(seo.twitterDescription, lang) ?? description;

  const twitterImage = toAbsoluteUrl(
    pickLocalized(seo.twitterImage, lang) ?? ogImage,
    siteUrl
  );
  const twitterImageAlt =
    pickLocalized(seo.twitterImageAlt, lang) ?? ogImageAlt;

  // -------------------------
  // Build Metadata
  // -------------------------
  const metadata: Metadata = {
    title,
    description,
  };

  if (robots) {
    // string wie "index,follow" oder "noindex,nofollow"
    metadata.robots = robots;
  }

  if (canonical) {
    metadata.alternates = { canonical };
  }

  metadata.openGraph = {
    title: ogTitle,
    description: ogDescription,
    type: ogType as any,
    url: ogUrl,
    siteName: ogSiteName,
    images: ogImage
      ? [
          {
            url: ogImage,
            alt: ogImageAlt,
          },
        ]
      : undefined,
  };

  metadata.twitter = {
    card: twitterCard as any,
    title: twitterTitle,
    description: twitterDescription,
    images: twitterImage
      ? [
          {
            url: twitterImage,
            alt: twitterImageAlt,
          } as any,
        ]
      : undefined,
  };

  return metadata;
}

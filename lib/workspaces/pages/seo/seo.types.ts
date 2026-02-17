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

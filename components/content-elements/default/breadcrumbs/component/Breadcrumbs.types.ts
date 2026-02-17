// components/content-elements/default/breadcrumbs/Breadcrumbs.types.ts

import { LocalizedString } from '../../utils/i18n';

export type BreadcrumbsProps = {
  data: BreadcrumbsData;
};

export type BreadcrumbsData = {
  links: BreadcrumbItem[];

  textColor?: string;
  linkTextColor?: string;
  highlightedTextColor?: string;
  dividerColor?: string;
  unwrapped?: boolean;

  // ✅ optional, damit Breadcrumbs die Sprache auslesen kann
  currentLanguage?: string;
};

export type BreadcrumbItem = {
  // ✅ NEU only: immer lokalisiert
  label: LocalizedString;

  // ✅ NEU only: immer lokalisiert (optional => letztes Crumb ohne Link)
  href?: LocalizedString;

  title?: string;
  highlighted?: boolean;
};

export type BreadcrumbsStyleProps = {
  $textColor?: BreadcrumbsData['textColor'];
  $linkTextColor?: BreadcrumbsData['linkTextColor'];
  $highlightedTextColor?: BreadcrumbsData['highlightedTextColor'];
  $dividerColor?: BreadcrumbsData['dividerColor'];
};

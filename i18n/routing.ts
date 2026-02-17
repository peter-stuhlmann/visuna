// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { generateRouting } from './generateRouting';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';

// 🔹 Für das Routing sind alle Locales einfach diese Sprachen
export const ALL_LOCALES = ALL_LANGUAGES;

// Static Routing-Definition für next-intl
export const routing = defineRouting({
  locales: ALL_LOCALES.map((lang) => lang.code),
  // defaultLocale ist hier nur noch „technisch“ relevant
  // (z.B. für Links ohne explizite locale), aber durch localePrefix: 'always'
  // gibt es im sichtbaren Routing immer einen Prefix (/de, /en, ...)
  defaultLocale: DEFAULT_LANGUAGES[0],
  localePrefix: 'never', // ⬅️ Jeder Request hat ein Prefix: /de, /en, ...
  localeDetection: false, // ⬅️ Keine Auto-Weiterleitung anhand Accept-Language
  pathnames: generateRouting(ALL_LANGUAGES.map((l) => l.code)),
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

/**
 * Helper, falls du aus einer Workspace-mainLanguage eine gültige Locale
 * für Links etc. ableiten willst.
 *
 * Da ALL_LOCALES = ALL_LANGUAGES, ist LanguageCode hier kompatibel.
 */
export function getWorkspaceDefaultLocale(
  mainLanguage: LanguageCode
): LanguageCode {
  if (ALL_LANGUAGES.map((l) => l.code).includes(mainLanguage)) {
    return mainLanguage as LanguageCode;
  }
  return routing.defaultLocale;
}

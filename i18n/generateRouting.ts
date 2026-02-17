// utils/generateRouting.ts
import { LanguageCode } from '@/components/language-settings/languages';
import { routes } from './routes';

export type Pathnames = Record<string, Partial<Record<LanguageCode, string>>>;

/**
 * routes:
 *  {
 *    home: { de: '/', en: '/en', es: '/es' },
 *    about: { de: '/ueber-uns', en: '/about' },
 *    ...
 *  }
 *
 * generateRouting(frontendLanguages) filtert pro Route nur die
 * Sprachen, die wirklich im Frontend aktiv sind.
 */
export function generateRouting(frontendLanguages: LanguageCode[]): Pathnames {
  const activeLanguages = Array.from(new Set(frontendLanguages));
  const pathnames: Pathnames = {};

  for (const key in routes) {
    if (!Object.prototype.hasOwnProperty.call(routes, key)) continue;

    const typedKey = key as keyof typeof routes;
    const routeConfig = routes[typedKey] as Partial<
      Record<LanguageCode, string>
    >;

    const perRoute: Partial<Record<LanguageCode, string>> = {};

    for (const lang of activeLanguages) {
      const pathname = routeConfig[lang];
      if (pathname) {
        perRoute[lang] = pathname;
      }
    }

    // Nur aufnehmen, wenn es für diese Route mindestens eine Sprache gibt
    if (Object.keys(perRoute).length > 0) {
      pathnames[`/${key}`] = perRoute;
    }
  }

  return pathnames;
}

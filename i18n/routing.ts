import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { generateRouting } from './generateRouting';

export const routing = defineRouting({
  locales: ['en', 'de'],
  // Setze hier defaultLocale auf 'de'
  defaultLocale: 'en',
  pathnames: generateRouting(),
});

export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

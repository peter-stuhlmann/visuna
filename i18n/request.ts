// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { LanguageCode } from '@/components/language-settings/languages';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback auf defaultLocale, wenn irgendwas komisch ist
  if (!locale || !routing.locales.includes(locale as LanguageCode)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Du benutzt keine messages/*.json – also einfach leer lassen.
    messages: {},
  };
});

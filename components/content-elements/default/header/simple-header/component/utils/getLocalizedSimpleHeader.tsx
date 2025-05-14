import { Locale } from '@/i18n/routing';
import {
  SimpleHeaderData,
  LocalizedSimpleHeaderData,
} from '../SimpleHeader.types';

export function getLocalizedSimpleHeader(
  data: SimpleHeaderData,
  locale: Locale
): LocalizedSimpleHeaderData {
  return {
    logo: {
      src: data.logo.src,
      alt: data.logo.alt,
      width: data.logo.width,
      height: data.logo.height,
    },
    navItems: data.navItems.map((section) => ({
      label: section.label[locale],
      href: section.href,
    })),
  };
}

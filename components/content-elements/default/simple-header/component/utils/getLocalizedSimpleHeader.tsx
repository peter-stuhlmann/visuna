import { LanguageCode } from '@/components/language-settings/languages';
import {
  SimpleHeaderData,
  LocalizedSimpleHeaderData,
} from '../SimpleHeader.types';

export function getLocalizedSimpleHeader(
  data: SimpleHeaderData,
  locale: LanguageCode
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

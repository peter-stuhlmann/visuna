import { Locale } from '@/i18n/routing';
import { FooterData, LocalizedFooterData } from '../Footer.types';

export function getLocalizedFooter(
  data: FooterData,
  locale: Locale
): LocalizedFooterData {
  return {
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    title: data.title[locale],
    nav: data.nav.map((section) => ({
      title: section.title[locale],
      links: section.links.map((link) => {
        const href =
          link.href.startsWith('http') || link.href.startsWith('mailto')
            ? link.href
            : '/' + locale + '/' + link.href;

        return {
          name: link.name[locale],
          href: href,
        };
      }),
    })),
    subFooter: {
      content: data.subFooter.content[locale],
      fontSize: data.subFooter.fontSize,
      align: data.subFooter.align,
    },
  };
}

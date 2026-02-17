import { FooterData, LocalizedFooterData } from '../Footer.types';
import { CMS_LANGUGES } from '@/types/cms/types';

export function getLocalizedFooter(
  data: FooterData,
  locale: CMS_LANGUGES
): LocalizedFooterData {
  return {
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    title: data.title[locale],
    nav: data.nav.map((section) => ({
      title: section.title[locale],
      links: section.links.map((link) => ({
        name: link.name[locale],
        href: link.href,
      })),
    })),
    subFooter: {
      content: data.subFooter.content[locale],
      fontSize: data.subFooter.fontSize,
      align: data.subFooter.align,
    },
  };
}

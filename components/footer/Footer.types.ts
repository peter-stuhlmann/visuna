import { Locale } from '@/i18n/routing';
import { ReactNode } from 'react';

export type FooterProps = {
  data: LocalizedFooterData;
};

export interface FooterData {
  title: Record<Locale, string>;
  nav: NavSection[];
  subFooter: Record<Locale, string>;
}

export interface NavSection {
  title: Record<Locale, string>;
  links: LinkItem[];
}

export interface LinkItem {
  name: Record<Locale, string>;
  href: string;
}

export interface LocalizedFooterData {
  title: string;
  nav: {
    title: string;
    links: { name: string; href: string }[];
  }[];
  subFooter: string | ReactNode;
}

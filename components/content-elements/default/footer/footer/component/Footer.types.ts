import { Locale } from '@/i18n/routing';
import { ReactNode } from 'react';

export type FooterProps = {
  data: LocalizedFooterData;
  unwrapped?: boolean;
  className?: string;
};

export type SubFooterProps = {
  content: Record<Locale, string | ReactNode>;
  fontSize?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
};

export interface FooterData {
  title: Record<Locale, string>;
  nav: NavSection[];
  subFooter: {
    content: Record<Locale, string | ReactNode>;
    fontSize: 'small' | 'medium' | 'large';
    align: 'left' | 'center' | 'right';
  };
  backgroundColor?: string;
  textColor?: string;
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
  subFooter: {
    content: string | ReactNode;
    fontSize: 'small' | 'medium' | 'large';
    align: 'left' | 'center' | 'right';
  };
  backgroundColor?: string;
  textColor?: string;
}

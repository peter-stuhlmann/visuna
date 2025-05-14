import { Locale } from '@/i18n/routing';
import { ReactNode } from 'react';

export type SimpleHeaderProps = {
  data: LocalizedSimpleHeaderData;
  unwrapped?: boolean;
  className?: string;
};

export interface NavSection {
  title: Record<Locale, string>;
  links: LinkItem[];
}

export interface LinkItem {
  label: Record<Locale, string>;
  href: string;
}

export interface LocalizedLinkItem {
  label: string;
  href: string;
}

export interface LocalizedFooterData {
  title: string;
  nav: {
    title: string;
    navItems: LinkItem[];
  }[];
  subFooter: {
    content: string | ReactNode;
    fontSize: 'small' | 'medium' | 'large';
    align: 'left' | 'center' | 'right';
  };
  backgroundColor?: string;
  textColor?: string;
}

export interface LocalizedSimpleHeaderData {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  navItems: LocalizedLinkItem[];
}

export type SimpleHeaderData = {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  navItems: LinkItem[];
};

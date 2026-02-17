import { CMS_LANGUGES } from '@/types/cms/types';
import { ReactNode } from 'react';

export type FooterProps = {
  data: LocalizedFooterData;
  unwrapped?: boolean;
  className?: string;
};

export type SubFooterProps = {
  content: Record<CMS_LANGUGES, string | ReactNode>;
  fontSize?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
};

export interface FooterData {
  title: Record<CMS_LANGUGES, string>;
  nav: NavSection[];
  subFooter: {
    content: Record<CMS_LANGUGES, string | ReactNode>;
    fontSize: 'small' | 'medium' | 'large';
    align: 'left' | 'center' | 'right';
  };
  backgroundColor?: string;
  textColor?: string;
}

export interface NavSection {
  title: Record<CMS_LANGUGES, string>;
  links: LinkItem[];
}

export interface LinkItem {
  name: Record<CMS_LANGUGES, string>;
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

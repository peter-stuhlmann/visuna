import { CSSProperties } from 'react';

export type BreadcrumbItem = {
  label: string;
  href: string | null;
  title: string;
  isActive?: boolean;
};

export type BreadcrumbsProps = {
  links: BreadcrumbItem[];
  margin?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  style?: CSSProperties;
};

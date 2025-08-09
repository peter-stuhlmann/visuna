import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Seiten',
};

type PagesLayoutProps = {
  children: ReactNode;
};

export default function PagesLayout({ children }: PagesLayoutProps) {
  return children;
}

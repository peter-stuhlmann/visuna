import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Footer',
};

export default function FooterLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

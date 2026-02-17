import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Templates',
};

export default function TemplatesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

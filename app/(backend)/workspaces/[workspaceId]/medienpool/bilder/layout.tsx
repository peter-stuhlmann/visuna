import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Medienpool',
};

export default function MediaPoolLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Galerien',
};

export default function GalerienLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

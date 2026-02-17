import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Formulare',
};

export default function FormulareLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

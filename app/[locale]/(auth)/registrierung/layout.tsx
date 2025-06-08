import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Registrierung | VISUNA',
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

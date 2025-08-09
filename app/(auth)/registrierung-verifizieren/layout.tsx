import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Registrierung verifizieren | VISUNA',
};

export default function VerifyLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

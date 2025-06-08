import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Neues Passwort vergeben | VISUNA',
};

export default function NewPasswordLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

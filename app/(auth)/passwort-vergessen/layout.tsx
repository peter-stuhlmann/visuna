import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Passwort zurücksetzen | VISUNA',
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

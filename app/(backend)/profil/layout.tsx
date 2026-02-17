import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Mein Profil',
  description: 'Verwalte dein Profil, Profilbild und workspace-spezifische Einstellungen.',
};

export default function ProfilePageLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Spracheinstellungen',
};

export default function WorkspaceLanguageSettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Default-Einstellungen',
};

export default function WorkspaceDefaultSettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Workspace-Einstellungen',
};

export default function WorkspaceSettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

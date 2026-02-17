import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Benutzerverwaltung',
};

export default function WorkspaceUserManagementLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

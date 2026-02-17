import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Neuen Workspace anlegen',
};

export default function CreateNewWorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Workspaces',
};

export default function WorkspacesPageLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

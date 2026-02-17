import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Workspace bearbeiten',
};

export default async function WorkspacesPageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  // Global Auth Check for all workspace sub-pages
  const { hasAccess } = await checkWorkspaceAccess(workspaceId);

  if (!hasAccess) {
    notFound();
  }

  return <>{children}</>;
}

import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

import getLogs from './helpers/getLogs';
import Logs from '@/components/logs/Logs';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aktivitätsprotokoll',
  description:
    'Übersicht aller Aktivitäten im Workspace: Änderungen an Seiten, Medien, Benutzer:innen und Einstellungen nachvollziehen.',
};

export default async function LogsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  // Only admin / superadmin may view logs
  const { hasAccess, role } = await checkWorkspaceAccess(workspaceId);
  if (!hasAccess || (role !== 'admin' && role !== 'superadmin')) {
    redirect(`/workspaces/${workspaceId}/dashboard`);
  }

  const logs = await getLogs(workspaceId, role);

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: {
                de: 'Aktivitätsprotokoll (Logs)',
                en: 'Activity Log',
              },
              highlighted: true,
            },
          ],
        }}
      />
      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading element="h1" value="Aktivitäts&shy;protokoll (Logs)" />
              <Logs logs={logs} userRole={role} workspaceId={workspaceId} />
            </>
          ),
        }}
      />
    </>
  );
}

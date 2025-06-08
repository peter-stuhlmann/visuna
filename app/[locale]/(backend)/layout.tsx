import { ReactNode } from 'react';

import Header from '@/components/header';
import { SelectedWorkspaceProvider } from '@/components/workspaces/WorkspaceContext';
import { getServerSession } from 'next-auth';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { getWorkspace } from './workspaces/[id]/getWorkspace';
import { getWorkspaces } from './workspaces/getWorkspaces';
import { Footer } from '@/components/content-elements/default';
import { Locale } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';
import { getLocalizedFooter } from '@/components/content-elements/default/footer/footer';
import footerData from './footer-data';
import { Workspace } from '@/types';
import Status from '@/components/status';
import { StatusProvider } from '@/components/status/StatusContext';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  let currentWorkspace = null;
  let workspacesFromDB: Workspace[] = [];

  const session = await getServerSession();

  if (session && session.user) {
    const user = await getLoggedInUser();
    const currentWorkspaceId = user?.currentWorkspaceId;

    workspacesFromDB = (await getWorkspaces()) || [];

    if (currentWorkspaceId) {
      currentWorkspace = await getWorkspace(currentWorkspaceId);
    }

    // Fallback: falls kein Workspace gefunden wurde, nimm den ersten
    if (!currentWorkspace && workspacesFromDB.length > 0) {
      currentWorkspace = workspacesFromDB[0];
    }
  }

  // Clean für Client-Komponenten
  if (currentWorkspace) {
    currentWorkspace = JSON.parse(JSON.stringify(currentWorkspace));
  }

  const locale = await getLocale();
  const localizedFooter = getLocalizedFooter(footerData, locale as Locale);

  return (
    <SelectedWorkspaceProvider
      currentWorkspace={currentWorkspace}
      fallbackWorkspaces={workspacesFromDB}
    >
      <StatusProvider>
        <Header />
        <main>{children}</main>
        <Footer data={localizedFooter} element="footer" />
        <Status />
      </StatusProvider>
    </SelectedWorkspaceProvider>
  );
}

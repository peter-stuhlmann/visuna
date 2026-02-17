import { ReactNode } from 'react';
import { cookies } from 'next/headers';

// import Header from '@/components/header';
import { SelectedWorkspaceProvider } from '@/components/workspaces/WorkspaceContext';
import { getServerSession } from 'next-auth';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { getWorkspace } from './workspaces/[workspaceId]/getWorkspace';
import { getWorkspaces } from './workspaces/getWorkspaces';
// import { Footer } from '@/components/content-elements/default';
// import { Locale } from '@/i18n/routing';
// import { getLocale } from 'next-intl/server';
// import { getLocalizedFooter } from '@/components/content-elements/default/footer/footer';
// import footerData from './footer-data';
import Status from '@/components/status';
import { StatusProvider } from '@/components/status/StatusContext';
// import { NavbarProvider } from '@/utils/useNavbar';
import DashboardLayout from '@/components/dashboard-layout/DashboardLayout';
// import Navbar from '@/components/navbar/Navbar';
import { redirect } from 'next/navigation';
import { GlobalDashboardStyles } from '@/components/GlobalDashboard.styles';
import { DockProvider } from '@/utils/useDock';
import PageDockButtonWrapper from '@/components/page-dock-button/PageDockButtonWrapper';
// import CurrentWorkspaceDebug from '@/components/workspaces/CurrentWorkspaceDebug';
import { WorkspaceListItem } from '@/lib/workspaces/workspaces.types';
import { DockBarProvider } from '@/components/page-dock-button/DockBarContext';
import BottomDockBar from '@/components/page-dock-button/BottomDockBar';
import { FavoritesProvider } from '@/components/page-dock-button/useFavorites';
import AiChat from '@/components/ai-chat/AiChat';

export default async function DashboardPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  let currentWorkspace = null;
  let workspacesFromDB: WorkspaceListItem[] = [];

  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  let userRole = 'none';

  if (session && session.user) {
    const user = await getLoggedInUser();
    const currentWorkspaceId = user?.currentWorkspaceId;
    userRole = user?.workspaceProfile?.role ?? 'none';

    workspacesFromDB = (await getWorkspaces()) || [];

    if (currentWorkspaceId) {
      currentWorkspace = await getWorkspace(currentWorkspaceId);

      // Security Check: Hat der User Zugriff?
      if (!currentWorkspace || user.workspaceProfile.role === 'none') {
        const { notFound } = await import('next/navigation');
        notFound();
      }
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

  // const locale = await getLocale();
  // const localizedFooter = getLocalizedFooter(footerData, locale as Locale);

  // Read dock state from cookie
  const cookieStore = await cookies();
  const dockIsFixedCookie = cookieStore.get('dock-is-fixed')?.value;
  const initialDockIsFixed = dockIsFixedCookie === 'true' ? true : dockIsFixedCookie === 'false' ? false : true;

  return (
    <SelectedWorkspaceProvider initialWorkspace={currentWorkspace} initialUserRole={userRole}>
      <StatusProvider>
        <GlobalDashboardStyles />
        {/* <Header /> */}
        {/* <NavbarProvider> */}
        <DockBarProvider>
          <DockProvider initialIsFixed={initialDockIsFixed}>
            <FavoritesProvider>
            <DashboardLayout>
              {/* <Navbar /> */}
              <PageDockButtonWrapper />
              <AiChat />
              <BottomDockBar />
              <main>
                {/* <CurrentWorkspaceDebug /> */}
                {children}
              </main>
              {/* <Footer data={localizedFooter} element="footer" /> */}
            </DashboardLayout>
            </FavoritesProvider>
          </DockProvider>
        </DockBarProvider>
        {/* </NavbarProvider> */}
        <Status />
      </StatusProvider>
    </SelectedWorkspaceProvider>
  );
}

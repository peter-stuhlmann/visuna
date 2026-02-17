import { notFound, redirect } from 'next/navigation';

import InviteCodesManagement from '@/components/invite-codes-management/InviteCodesManagement';
import isUserLoggedIn from '@/utils/isUserLoggedIn';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getUsers } from './getUsers';
import { User } from '@/lib/users/users.types';
import Spacer from '@/components/content-elements/default/spacer';
import type { Metadata } from 'next';
import { checkWorkspaceAccess } from '@/lib/workspaces/workspaces.auth';

export const metadata: Metadata = {
  title: 'Benutzer:innenverwaltung',
  description:
    'Verwalte die Mitglieder Deines Workspaces: Benutzer:innen einladen, Rollen zuweisen, Einladungen verwalten und Zugriffsrechte bearbeiten.',
};

const serializeUser = (user: User): User => ({
  ...user,
  _id: user._id,
  currentWorkspaceId: user.currentWorkspaceId?.toString?.() ?? null,
  createdAt: user.createdAt,
  workspaces: user.workspaces,
});

export default async function UsersManagementPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }

  const { hasAccess, role, workspace, user: loggedInUser } =
    await checkWorkspaceAccess(workspaceId);

  if (!hasAccess || !workspace || !loggedInUser) {
    notFound();
  }

  // read-only users cannot see user management at all
  if (role === 'read-only') {
    return (
      <>
        Du hast keine Berechtigung, die Benutzer:innenverwaltung zu sehen.
      </>
    );
  }

  const users = await getUsers();

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
              label: { de: 'Benutzer:innenverwaltung', en: 'User management' },
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
              <Heading
                element="h1"
                value={`Benutzer:innen im Workspace ${workspace.name}`}
              />
              <Spacer data={{ size: 's' }} />
              <InviteCodesManagement
                users={users ? users.map(serializeUser) : []}
                loggedInUser={serializeUser(loggedInUser)}
                userRole={role}
              />
            </>
          ),
        }}
      />
    </>
  );
}

import { FC } from 'react';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { notFound, redirect } from 'next/navigation';
import { getWorkspace } from '../getWorkspace';

import InviteCodesManagement from '@/components/invite-codes-management/InviteCodesManagement';
import isUserLoggedIn from '@/utils/isUserLoggedIn';
import { Heading, Wrapper } from '@/components/content-elements/default';
import { getUsers } from './getUsers';
import { User } from '@/types';

const serializeUser = (user: User): User => ({
  ...user,
  _id: user._id?.toString?.() ?? '',
  currentWorkspaceId: user.currentWorkspaceId?.toString?.() ?? null,
  createdAt: user.createdAt?.toString?.(),
  workspaces: user.workspaces,
});

const UsersManagementPage: FC = async () => {
  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    redirect('/login');
  }

  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser || !loggedInUser.currentWorkspaceId) {
    notFound();
  }

  const currentWorkspace = await getWorkspace(loggedInUser.currentWorkspaceId);
  if (!currentWorkspace || !Array.isArray(currentWorkspace.access)) {
    notFound();
  }

  const accessEntry = currentWorkspace.access.find(
    (entry: { userId: string; role: string }) =>
      entry.userId === loggedInUser._id.toString()
  );

  if (!accessEntry || accessEntry.role.toLowerCase() !== 'admin') {
    return (
      <>
        Als {accessEntry?.role || 'Unbekannt'} bist Du nicht berechtigt, diese
        Seite zu sehen.
      </>
    );
  }

  const users = await getUsers();

  return (
    <Wrapper>
      <Heading
        element="h1"
        value={`Benutzer:innen im Workspace ${currentWorkspace.name}`}
      />
      <InviteCodesManagement
        users={users ? users.map(serializeUser) : []}
        loggedInUser={serializeUser(loggedInUser)}
      />
    </Wrapper>
  );
};

export default UsersManagementPage;

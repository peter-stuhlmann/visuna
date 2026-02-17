// app/(backend)/profil/page.tsx
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import LogoutButton from '@/components/logout/LogoutButton';
import ProfileSettings from '@/components/profile-settings/ProfileSettings';
import WorkspaceStatusToggle from '@/components/profile-settings/WorkspaceStatusToggle';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { getWorkspaceById } from '@/lib/workspaces/workspaces.repo';
import { getWorkspaces } from '../workspaces/getWorkspaces';
import { redirect } from 'next/navigation';
import { FC } from 'react';

const ProfilePage: FC = async () => {
  const loggedInUser = await getLoggedInUser();
  
  const currentWorkspace = loggedInUser?.currentWorkspaceId
    ? await getWorkspaceById(loggedInUser.currentWorkspaceId)
    : null;

  if (!loggedInUser) {
    redirect('/login');
  }

  const workspaces = (await getWorkspaces()) || [];

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'none',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
          },
          currentLanguage: 'de',
          links: [
            {
              label: { de: 'Profil', en: 'Profile' },
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
              <Heading value="Mein Profil" element="h1" />

              <ProfileSettings
                initialProfile={loggedInUser.profile}
                initialWorkspaceProfile={loggedInUser.workspaceProfile}
                workspaces={JSON.parse(JSON.stringify(workspaces))}
                userId={loggedInUser._id}
                currentWorkspaceId={loggedInUser.currentWorkspaceId || ''}
              />

              <div style={{ margin: '2rem 0' }}>
                <h3 style={{ marginBottom: '1rem' }}>Test-Einstellungen</h3>
                <WorkspaceStatusToggle workspace={currentWorkspace} />
              </div>

              <LogoutButton loggedInUser={loggedInUser} />
            </>
          ),
        }}
      />
    </>
  );
};

export default ProfilePage;

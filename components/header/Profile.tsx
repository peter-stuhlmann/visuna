'use client';

import { FC, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { User } from '@/types';
import { DropdownMenu } from '../content-elements/default';

type ProfileProps = {
  loggedInUser: User;
};

const Profile: FC<ProfileProps> = () => {
  const { selectedWorkspace } = useSelectedWorkspace();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    signOut();
  };

  return (
    <DropdownMenu
      button={{
        children: 'Profil',
        icon: 'MdOutlinePersonOutline',
        showOnlyIconOnMobile: true,
      }}
      menuItems={[
        {
          children: '👤 Mein Profil',
          href: '/profil',
          align: 'left',
        },
        {
          children: '🧩 Workspaces',
          href: '/workspaces',
          align: 'left',
        },
        {
          children: '👥 Benutzerverwaltung',
          href: `/workspaces/${selectedWorkspace?._id}/benutzerverwaltung`,
        },
        {
          children: `🚪 ${isLoading ? 'Du wirst ausgeloggt...' : 'Log out'}`,
          onClick: handleLogout,
          align: 'left',
        },
      ]}
      // onClick={handleChange}
    />
  );
};

export default Profile;

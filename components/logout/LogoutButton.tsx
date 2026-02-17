'use client';

import { FC, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '../content-elements/default';
import { User } from '@/lib/users/users.types';

type LogoutButtonProps = {
  loggedInUser: User;
};

const LogoutButton: FC<LogoutButtonProps> = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    signOut();
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      Ausloggen
    </Button>
  );
};

export default LogoutButton;

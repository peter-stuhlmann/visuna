'use client';

import { FC } from 'react';
import WorkspaceSelect from './WorkspaceSelect';
import Profile from './Profile';
import { Button } from '../content-elements/default';
import { User, Workspace } from '@/types';
import LocaleSwitcherSelect from '../LocaleSwitcherSelect';

type Props = {
  workspaces: Workspace[];
  loggedInUser: User | null;
};

const HeaderClientPart: FC<Props> = ({ workspaces, loggedInUser }) => {
  return (
    <>
      {workspaces.length > 0 && <WorkspaceSelect workspaces={workspaces} />}

      {loggedInUser ? (
        <Profile loggedInUser={loggedInUser} />
      ) : (
        <Button variant="outlined" href="/login">
          Login
        </Button>
      )}

      <LocaleSwitcherSelect />
    </>
  );
};

export default HeaderClientPart;

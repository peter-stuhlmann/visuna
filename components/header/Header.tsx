import React, { FC } from 'react';
import Link from 'next/link';
import Logo from '../Logo';
import { getWorkspaces } from '@/app/[locale]/(backend)/workspaces/getWorkspaces';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import HeaderBackendPartial from './HeaderBackendPartial';
import { SimpleHeaderContainer } from '../content-elements/default/header/simple-header/component/SimpleHeader.styles';
import { Wrapper } from '../content-elements/default';

const Header: FC = async () => {
  const loggedInUser = await getLoggedInUser();
  const workspaces = await getWorkspaces();

  return (
    <Wrapper>
      <SimpleHeaderContainer>
        <Link href="/" className="logo" aria-label="Go to homepage">
          <Logo />
        </Link>
        <div>
          <HeaderBackendPartial
            workspaces={workspaces || []}
            loggedInUser={loggedInUser}
          />
        </div>
      </SimpleHeaderContainer>
    </Wrapper>
  );
};

export default Header;

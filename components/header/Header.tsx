import React, { FC } from 'react';
import Link from 'next/link';
import Logo from '../Logo';
import { getWorkspaces } from '@/app/(backend)/workspaces/getWorkspaces';
import { getLoggedInUser } from '@/utils/getLoggedInUser';
import HeaderBackendPartial from './HeaderBackendPartial';
import { SimpleHeaderContainer } from '../content-elements/default/header/simple-header/component/SimpleHeader.styles';
import { Wrapper } from '../content-elements/default';

const Header: FC = async () => {
  const loggedInUser = await getLoggedInUser();
  const workspaces = await getWorkspaces();

  return (
    <div style={{ position: 'fixed', top: 0, zIndex: 1000, left: 0, right: 0 }}>
      <Wrapper
        data={{
          innerWidth: 'full',
          paddingBottom: 's',
          paddingTop: 's',
          paddingLeft: 'm',
          paddingRight: 'm',
          children: (
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
          ),
          backgroundColor: '#fff',
          // style: {
          //   borderBottom: '1px solid #e0e0e0',
          //   position: 'fixed',
          //   marginBottom: '84px',
          //   top: '0',
          //   zIndex: 1000,
          // },
        }}
      />
    </div>
  );
};

export default Header;

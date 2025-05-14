import React, { FC } from 'react';
import { HeaderContainer } from './Header.styles';
import LocaleSwitcherSelect from '../LocaleSwitcherSelect';
import Link from 'next/link';
import Logo from '../Logo';

const Header: FC = () => {
  return (
    <HeaderContainer>
      <div>
        <Link href="/" className="logo">
          <Logo />
        </Link>
        <div>
          <noscript>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                href="/de"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Deutsch
              </Link>
              <Link
                href="/en"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                English
              </Link>
            </div>
          </noscript>
          <LocaleSwitcherSelect />
        </div>
      </div>
    </HeaderContainer>
  );
};

export default Header;

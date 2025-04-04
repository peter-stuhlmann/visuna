import React, { FC } from 'react';
import { HeaderContainer } from './Header.styles';
import LocaleSwitcherSelect from '../LocaleSwitcherSelect';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <HeaderContainer>
      <div>
        <div className="logo">
          &#091;
          <span>PS</span>
          <span>UI</span>
          &#093;
          <span>Content Elements</span>
        </div>
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

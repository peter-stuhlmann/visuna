import { FC } from 'react';
import Link from 'next/link';
import Logo from '../Logo';

import { Wrapper } from '../content-elements/default';
import { SimpleHeaderContainer } from '../content-elements/default/simple-header/component/SimpleHeader.styles';

const Header: FC = async () => {
  return (
    <div style={{ position: 'fixed', top: 0, zIndex: 1000, left: 0, right: 0 }}>
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
            <SimpleHeaderContainer>
              <Link href="/" className="logo" aria-label="Go to homepage">
                <Logo />
              </Link>
            </SimpleHeaderContainer>
          ),
        }}
      />
    </div>
  );
};

export default Header;

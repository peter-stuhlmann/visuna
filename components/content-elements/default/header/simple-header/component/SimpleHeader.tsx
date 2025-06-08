'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Navigation, SimpleHeaderContainer } from './SimpleHeader.styles';
import { SimpleHeaderProps } from './SimpleHeader.types';
import NavItem from './NavItem';
import dynamic from 'next/dynamic';
import HeaderMenuButton from './HeaderMenuButton';
import Image from 'next/image';
const LocaleSwitcherSelect = dynamic(
  () => import('@/components/LocaleSwitcherSelect'),
  { ssr: false }
);

const SimpleHeader: FC<SimpleHeaderProps> = ({ data, className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <SimpleHeaderContainer className={className}>
      <Link href="/" className="logo">
        <Image
          src={data.logo.src}
          alt={data.logo.alt}
          width={data.logo.width}
          height={data.logo.height}
          priority
        />
      </Link>
      <div>
        <HeaderMenuButton
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        <Navigation $isMenuOpen={isMenuOpen}>
          <ul>
            {data.navItems.map((navItem, idx: number) => (
              <NavItem
                key={'navItem' + idx}
                href={navItem.href}
                onClick={() => setIsMenuOpen(false)}
                label={navItem.label}
              />
            ))}
          </ul>
          <LocaleSwitcherSelect />
        </Navigation>
      </div>
    </SimpleHeaderContainer>
  );
};

export default SimpleHeader;

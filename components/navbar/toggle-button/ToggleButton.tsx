'use client';

import { FC, useEffect } from 'react';
import { ToggleButton } from './ToggleButton.styles';
import { useNavbar } from '@/utils/useNavbar';
import { MdArrowForward } from 'react-icons/md';
import { MdArrowBack } from 'react-icons/md';

const NavbarToggleButton: FC = () => {
  const { isCollapsed, setIsCollapsed } = useNavbar();

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (isCollapsed) {
        navbar.classList.add('collapsed');
      } else {
        navbar.classList.remove('collapsed');
      }
    }
  }, [isCollapsed]);

  return (
    <ToggleButton
      onClick={toggleNavbar}
      aria-label="toggle navbar"
      $isCollapsed={isCollapsed}
    >
      <>
        {!isCollapsed ? (
          <>
            <MdArrowBack />{' '}
            <span className="block-item-label">Menü zuklappen</span>
          </>
        ) : (
          <>
            <MdArrowForward />{' '}
            <span className="block-item-label">Menü zuklappen</span>
          </>
        )}
      </>
    </ToggleButton>
  );
};

export default NavbarToggleButton;

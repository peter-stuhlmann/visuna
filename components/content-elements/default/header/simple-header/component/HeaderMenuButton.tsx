'use client';

import { FC, useEffect } from 'react';
import Button from '../../../button/button';

type HeaderMenuButtonProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
};

const HeaderMenuButton: FC<HeaderMenuButtonProps> = ({
  isMenuOpen,
  setIsMenuOpen,
}) => {
  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.classList.add('no-scroll'); // <html>
      document.body.classList.add('no-scroll'); // <body>
    } else {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  return (
    <Button
      className="menu-button"
      aria-label="Menu"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      {isMenuOpen ? 'SCHLIESSEN' : 'MENÜ'}
    </Button>
  );
};

export default HeaderMenuButton;

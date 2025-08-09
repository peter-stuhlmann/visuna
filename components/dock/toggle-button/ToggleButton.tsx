'use client';

import { FC, useEffect } from 'react';
import { ToggleButton } from './ToggleButton.styles';
import { useDock } from '@/utils/useDock';
import { FaLock, FaLockOpen } from 'react-icons/fa';

const DockToggleButton: FC = () => {
  const { isFixed, setIsFixed } = useDock();

  const toggleNavbar = () => {
    setIsFixed(!isFixed);
  };

  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (isFixed) {
        navbar.classList.add('collapsed');
      } else {
        navbar.classList.remove('collapsed');
      }
    }
  }, [isFixed]);

  return (
    <ToggleButton
      onClick={toggleNavbar}
      aria-label={isFixed ? 'Löse das Dock' : 'Fixiere das Dock'}
      $isFixed={isFixed}
    >
      <>
        {isFixed ? (
          <FaLock aria-hidden="true" />
        ) : (
          <FaLockOpen aria-hidden="true" />
        )}
      </>
    </ToggleButton>
  );
};

export default DockToggleButton;

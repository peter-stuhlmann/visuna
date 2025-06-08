'use client';

import React, { useState, FC, useRef, useEffect } from 'react';

import { DropdownMenuProps } from './DropdownMenu.types';
import {
  DropdownMenuOptions,
  DropdownMenuWrapper,
} from './DropdownMenu.styles';
import Button from '../../../button/button';

const DropdownMenu: FC<DropdownMenuProps> = ({
  button,
  menuItems = [],
  borderRadius = 'l',
}) => {
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOptionsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <DropdownMenuWrapper>
      <Button
        ref={buttonRef}
        variant="text"
        onClick={() => setIsOptionsMenuOpen((prev) => !prev)}
        icon={button.icon}
        showOnlyIconOnMobile={button.showOnlyIconOnMobile}
      >
        {button.children}
      </Button>

      {isOptionsMenuOpen && (
        <DropdownMenuOptions $borderRadius={borderRadius}>
          {menuItems.map((menuItem, idx: number) => {
            return (
              <Button
                key={'menu-item' + idx}
                variant="text"
                icon={menuItem.icon}
                onClick={(event) => {
                  setIsOptionsMenuOpen(false);
                  if (menuItem.onClick) {
                    menuItem.onClick(event);
                  }
                }}
                href={menuItem.href}
                aria-label={menuItem.ariaLabel}
                borderRadius={'none'}
                align={menuItem.align}
                fullWidth
              >
                {menuItem.children}
              </Button>
            );
          })}
        </DropdownMenuOptions>
      )}
    </DropdownMenuWrapper>
  );
};

export default DropdownMenu;

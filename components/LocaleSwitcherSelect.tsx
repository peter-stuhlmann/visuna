'use client';

import { useEffect, useState, FC, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Button } from './content-elements/default';
import styled from 'styled-components';
import { IconName } from './content-elements/default/icons/icon/component/Icon.types';

interface LanguageSwitcherSelectProps {
  children?: ReactNode;
  icon?: IconName;
  borderRadius?: string;
}

type DropdownMenuProps = {
  $borderRadius?: string;
};

const languageOptions: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'de', label: 'Deutsch', flag: '/img/de.webp' },
  { locale: 'en', label: 'English', flag: '/img/en.svg' },
];

const LocaleSwitcherSelect: FC<LanguageSwitcherSelectProps> = ({
  children,
  icon = 'MdLanguage',
  borderRadius = '1rem',
}) => {
  const pathname = usePathname();
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    setMenuOpen(false);
    let newPath = '';

    if (!pathname) {
      newPath = `/${newLocale}`;
    } else {
      const segments = pathname.split('/');
      if (segments[1] === 'de' || segments[1] === 'en') {
        segments[1] = newLocale;
      } else {
        segments.splice(1, 0, newLocale);
      }
      newPath = segments.join('/') || '/';
    }

    window.location.href = newPath;
  };

  const currentLanguage = languageOptions.find(
    (opt) => opt.locale === locale
  )?.label;

  return (
    <>
      {isMounted && (
        <DropdownWrapper>
          <Button
            ref={buttonRef}
            variant="text"
            onClick={() => setMenuOpen((prev) => !prev)}
            ariaLabel="language switcher"
            icon={icon}
          >
            {currentLanguage}
          </Button>

          {menuOpen && (
            <DropdownMenu $borderRadius={borderRadius}>
              {languageOptions.map((option) => (
                <DropdownItem
                  key={option.locale}
                  disabled={option.locale === locale}
                  onClick={() =>
                    option.locale !== locale &&
                    handleLanguageChange(option.locale)
                  }
                >
                  <Image src={option.flag} alt="" width={24} height={16} />
                  {option.label}
                </DropdownItem>
              ))}
              {children}
            </DropdownMenu>
          )}
        </DropdownWrapper>
      )}
    </>
  );
};

export default LocaleSwitcherSelect;

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.ul<DropdownMenuProps>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: ${({ $borderRadius }) => $borderRadius};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0 0 0;
  padding: 0.5rem 0;
  list-style: none;
  z-index: 10000;
  min-width: 160px;
  overflow: hidden;
`;

const DropdownItem = styled.li<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: 0.2s;

  &:hover {
    background: ${({ disabled }) => (disabled ? 'none' : '#f2f2f2')};
  }

  img {
    width: 24px;
    height: 16px;
    object-fit: cover;
  }
`;

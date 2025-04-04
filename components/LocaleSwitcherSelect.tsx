'use client';

import { useEffect, useState, type FC, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import Image from 'next/image';
import { useLocale } from 'next-intl';

interface LanguageSwitcherSelectProps {
  children?: ReactNode;
}

const languageOptions: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'de', label: 'Deutsch', flag: '/img/de.webp' },
  { locale: 'en', label: 'English', flag: '/img/en.svg' },
];

const LocaleSwitcherSelect: FC<LanguageSwitcherSelectProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const locale = useLocale();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    handleClose();
    let newPath = '';

    if (!pathname) {
      newPath = `/${newLocale}`;
    } else {
      // Zerlege den aktuellen Pfad in Segmente
      const segments = pathname.split('/');
      // segments[0] ist leer, segments[1] ist eventuell das Locale
      if (segments[1] === 'de' || segments[1] === 'en') {
        segments[1] = newLocale;
      } else {
        // Falls kein Locale vorhanden ist, füge es als erstes nicht-leeres Segment ein
        segments.splice(1, 0, newLocale);
      }
      newPath = segments.join('/') || '/';
    }

    // Reload
    window.location.href = newPath;
  };

  return (
    <>
      {isMounted && (
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label={'language switcher'}
        >
          <LanguageIcon />
        </IconButton>
      )}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languageOptions.map((option) => (
          <MenuItem
            key={option.locale}
            disabled={option.locale === locale}
            onClick={() => handleLanguageChange(option.locale)}
          >
            <ListItemIcon aria-hidden="true">
              <Image src={option.flag} alt="" width={24} height={16} />
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
        {children}
      </Menu>
    </>
  );
};

export default LocaleSwitcherSelect;

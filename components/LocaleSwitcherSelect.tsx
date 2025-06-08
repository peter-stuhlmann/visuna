'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { DropdownMenu } from './content-elements/default';
import { IconName } from './content-elements/default/icons/icon/component/Icon.types';
import { BorderRadiusOptions } from './content-elements/default/types';
import { useLocale } from 'next-intl';

const languageOptions: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { locale: 'en', label: 'English', flag: '🇬🇧' },
];

type LanguageSwitcherSelectProps = {
  icon?: IconName;
  borderRadius?: BorderRadiusOptions;
};

const LocaleSwitcherSelect: FC<LanguageSwitcherSelectProps> = ({
  icon = 'MdLanguage',
  borderRadius = 'l',
}) => {
  const pathname = usePathname();
  const locale = useLocale();

  const currentLanguage = languageOptions.find(
    (opt) => opt.locale === locale
  )?.label;

  return (
    <>
      <DropdownMenu
        borderRadius={borderRadius}
        button={{
          children: currentLanguage,
          icon: icon,
          showOnlyIconOnMobile: true,
        }}
        menuItems={languageOptions.map((language) => ({
          children: `${language.flag} ${language.label}`,
          href: `/${language.locale}${pathname.replace(
            new RegExp(`^/(${languageOptions.map((l) => l.locale).join('|')})`),
            ''
          )}`,
          align: 'left',
        }))}
      />
    </>
  );
};

export default LocaleSwitcherSelect;

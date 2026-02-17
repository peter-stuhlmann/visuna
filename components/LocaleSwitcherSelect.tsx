'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { DropdownMenu } from './content-elements/default';
import { BorderRadiusOptions } from './content-elements/default/types';
import { useLocale } from 'next-intl';
import type { IconProps } from './content-elements/default/core/icons/icon/component/Icon.types';
import { LanguageCode } from './language-settings/languages';

const languageOptions: { locale: LanguageCode; label: string; flag: string }[] =
  [
    { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { locale: 'en', label: 'English', flag: '🇬🇧' },
  ];

type LanguageSwitcherSelectProps = {
  icon?: IconProps;
  borderRadius?: BorderRadiusOptions;
};

const LocaleSwitcherSelect: FC<LanguageSwitcherSelectProps> = ({
  icon = { name: 'MdLanguage' },
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
            // entferne vorhandenes /de oder /en am Anfang des Pfads
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

// components/content-elements/default/breadcrumbs/Breadcrumbs.tsx
'use client';

import { FC, useMemo } from 'react';
import Link from 'next/link';

import type {
  BreadcrumbItem,
  BreadcrumbsProps,
} from './Breadcrumbs.types';
import { BreadcrumbsContainer } from './Breadcrumbs.styles';
import { makeStableKeys } from '@/utils/stableKeys';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import type { LanguageCode } from '@/components/language-settings/languages';

/* =======================
   i18n helpers (NEU only)
   erwartet: LocalizedString = { de,en,... }
======================= */

import { LocalizedString, resolveLocalizedText } from '../../utils/i18n';

const Breadcrumbs: FC<BreadcrumbsProps> = ({ data }) => {
  const {
    links,
    textColor,
    linkTextColor,
    highlightedTextColor,
    dividerColor,
    currentLanguage,
  } = (data ?? {}) as BreadcrumbsProps['data'] & {
    currentLanguage?: LanguageCode;
  };

  const lang: LanguageCode =
    (currentLanguage as LanguageCode | undefined) ?? DEFAULT_LANGUAGES[0];

  const safeLinks: BreadcrumbItem[] = Array.isArray(links)
    ? links.map((l) =>
        l && typeof l === 'object'
          ? (l as BreadcrumbItem)
          : ({} as BreadcrumbItem)
      )
    : [];

  const keys = useMemo(
    () =>
      makeStableKeys(safeLinks, {
        prefix: 'bc',
        getId: (it) => {
          const label = resolveLocalizedText(it.label as LocalizedString, lang);
          const href = resolveLocalizedText(it.href as LocalizedString, lang);
          return href || label || it.title || 'bc';
        },
      }),
    [safeLinks, lang]
  );

  return (
    <BreadcrumbsContainer
      $textColor={textColor}
      $linkTextColor={linkTextColor}
      $highlightedTextColor={highlightedTextColor}
      $dividerColor={dividerColor}
    >
      {safeLinks.map((link, idx) => {
        const key = keys[idx];

        const label = resolveLocalizedText(link.label as LocalizedString, lang);
        const href = resolveLocalizedText(link.href as LocalizedString, lang);
        const highlighted = !!link.highlighted;

        return href ? (
          <Link
            key={key}
            href={href}
            className={highlighted ? 'highlighted' : ''}
            title={link.title}
          >
            <span>{label}</span>
          </Link>
        ) : (
          <span
            key={key}
            className={highlighted ? 'highlighted' : ''}
            title={link.title}
          >
            <span>{label}</span>
          </span>
        );
      })}
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;

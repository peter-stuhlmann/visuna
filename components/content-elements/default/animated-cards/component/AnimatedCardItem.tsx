'use client';

import React, { FC, MouseEvent } from 'react';
import {
  BigIconWrap,
  CardLink,
  SmallIconWrap,
  Subtitle,
  Title,
} from './AnimatedCards.styles';
import type {
  CardProps,
  CardElement,
  LocalizedFieldValue,
  SingleLineElement,
} from './AnimatedCards.types';
import Icon from '../../core/icons/icon';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import type { LanguageCode } from '@/components/language-settings/languages';

/* =======================
   Helpers (NEU only)
======================= */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSingleLineElement(v: unknown): v is SingleLineElement {
  return (
    v === 'div' ||
    v === 'h1' ||
    v === 'h2' ||
    v === 'h3' ||
    v === 'h4' ||
    v === 'h5' ||
    v === 'h6'
  );
}

function isLocalizedHtml(v: unknown): v is Record<string, string> {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

function isLocalizedFieldValue(v: unknown): v is LocalizedFieldValue {
  if (!isRecord(v)) return false;

  const value = (v as { value?: unknown }).value;
  const element = (v as { element?: unknown }).element;

  if (!isLocalizedHtml(value)) return false;
  if (!isSingleLineElement(element)) return false;

  return true;
}

function pickLocalizedHtml(field: LocalizedFieldValue, lang: LanguageCode) {
  const map = field.value;

  const byLang = map[lang];
  if (typeof byLang === 'string' && byLang.trim()) return byLang.trim();

  const de = map.de;
  if (typeof de === 'string' && de.trim()) return de.trim();

  const first = Object.values(map).find(
    (v) => typeof v === 'string' && v.trim()
  );
  return first ? first.trim() : '';
}

function resolveElementOnlyNewFormat(input: unknown): SingleLineElement {
  if (!isLocalizedFieldValue(input)) return 'div';
  return input.element;
}

/* =======================
   ✅ styled-components typing fix:
   Runtime kann "as", aber TS-Typen von Title/Subtitle erlauben es nicht.
   => Wir erweitern die Props sauber via unknown-cast (kein any).
======================= */

type WithAsProp<T> = T & { as?: SingleLineElement };

const TitlePoly = Title as unknown as React.ComponentType<
  WithAsProp<React.ComponentProps<typeof Title>>
>;

const SubtitlePoly = Subtitle as unknown as React.ComponentType<
  WithAsProp<React.ComponentProps<typeof Subtitle>>
>;

export const Card: FC<CardProps> = ({
  title,
  subtitle,
  icon,
  href,
  onClick,
  target,
  rel,
  overlayColor,
  borderColor,
  borderRadius,
  backgroundColor,
  currentLanguage,
}) => {
  const lang: LanguageCode = currentLanguage ?? DEFAULT_LANGUAGES[0];

  const asTag = onClick && !href ? ('button' as const) : ('a' as const);

  const handleClick = (e: MouseEvent<CardElement>) => {
    if (onClick) onClick(e);
  };

  const commonProps = {
    onClick: onClick ? handleClick : undefined,
  } as const;

  const computedRel =
    asTag === 'a' && target === '_blank' ? rel ?? 'noopener noreferrer' : rel;

  const elementSpecificProps =
    asTag === 'a'
      ? { href, target, rel: computedRel }
      : { type: 'button' as const };

  // Icon sicher extrahieren
  const iconName = typeof icon === 'string' ? icon : icon?.name ?? undefined;

  const smallColor =
    (typeof icon !== 'string' ? icon?.small?.color : undefined) || undefined;
  const smallHoverColor =
    (typeof icon !== 'string' ? icon?.small?.hoverColor : undefined) ||
    undefined;

  const bigColor =
    (typeof icon !== 'string' ? icon?.large?.color : undefined) || undefined;
  const bigHoverColor =
    (typeof icon !== 'string' ? icon?.large?.hoverColor : undefined) ||
    undefined;

  // ✅ title/subtitle: NEU only { value:{de,en}, element:'h2' }
  const titleHtml =
    title?.value && isLocalizedFieldValue(title.value)
      ? pickLocalizedHtml(title.value, lang)
      : '';

  const subtitleHtml =
    subtitle?.value && isLocalizedFieldValue(subtitle.value)
      ? pickLocalizedHtml(subtitle.value, lang)
      : '';

  const TitleTag = resolveElementOnlyNewFormat(title?.value);
  const SubtitleTag = resolveElementOnlyNewFormat(subtitle?.value);

  return (
    <CardLink
      as={asTag}
      {...commonProps}
      {...elementSpecificProps}
      $backgroundColor={backgroundColor}
      $overlayColor={overlayColor}
      $borderColor={borderColor}
      $borderRadius={borderRadius}
      $titleHoverColor={title?.hoverColor}
      $subTitleHoverColor={subtitle?.hoverColor}
      $smallIconHoverColor={smallHoverColor}
      $bigIconHoverColor={bigHoverColor}
    >
      {iconName && (
        <>
          <BigIconWrap $color={bigColor}>
            <Icon name={iconName} aria-hidden />
          </BigIconWrap>

          <SmallIconWrap $color={smallColor}>
            <Icon name={iconName} aria-hidden />
          </SmallIconWrap>
        </>
      )}

      <TitlePoly
        as={TitleTag}
        $color={title?.color}
        $textAlign={title?.align}
        $transform={title?.transform}
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />

      <SubtitlePoly
        as={SubtitleTag}
        $color={subtitle?.color}
        $textAlign={subtitle?.align}
        $transform={subtitle?.transform}
        dangerouslySetInnerHTML={{ __html: subtitleHtml }}
      />
    </CardLink>
  );
};

export default Card;

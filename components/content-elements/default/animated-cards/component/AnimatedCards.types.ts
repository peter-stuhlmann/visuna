// AnimatedCards.types.ts
import type { FC, MouseEvent } from 'react';
import type { LanguageCode } from '@/components/language-settings/languages';
import type { IconProps } from '@/components/content-elements/default';
import { BorderRadiusOptions } from '../../types';

export type LocalizedHtml = Record<string, string>;
export type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

export type TitleValue = {
  value: LocalizedFieldValue; // ✅ NEU only
  color?: string;
  hoverColor?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'normal' | 'uppercase';
};

export type SubtitleValue = {
  value: LocalizedFieldValue; // ✅ NEU only
  color?: string;
  hoverColor?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'normal' | 'uppercase';
};

export type IconColorState = {
  color?: string;
  hoverColor?: string;
};

export type IconState = {
  name?: IconProps['name'] | null;
  small: IconColorState;
  large: IconColorState;
};

export type CardElement = HTMLAnchorElement | HTMLButtonElement;

export type CardProps = {
  title: TitleValue;
  subtitle: SubtitleValue;

  icon?: string | IconState;
  href?: string;
  onClick?: (e: MouseEvent<CardElement>) => void;
  target?: string;
  rel?: string;

  overlayColor?: string;
  borderColor?: string;
  borderRadius?: BorderRadiusOptions;
  backgroundColor?: string;

  /** ✅ kommt vom Mapper via data.currentLanguage */
  currentLanguage?: LanguageCode;
};

export type AnimatedCardsData = {
  cards?: CardProps[];

  cardsPerRow?: number | string;
  stretchCards?: boolean;

  currentLanguage?: LanguageCode;
};

export type AnimatedCardsProps = {
  data?: AnimatedCardsData;
};

// (Optional) falls du es irgendwo so nutzt:
export type AnimatedCardsComponent = FC<AnimatedCardsProps>;

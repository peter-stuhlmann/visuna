import { CSSProperties, ReactNode } from 'react';
import { HeadingProps } from '../../core/heading';
import { OverlineProps } from '../../core/overline';
import { SublineProps } from '../../core/subline';
import { ScreenSizeOptions } from '../../types';
import { BaseTextProps } from '../../core/base-text';
import { ButtonProps } from '../../core/button';

export type VideoHeroProps = {
  data: VideoHeroData;
};

export type VideoHeroData = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode | string;
  heading?: HeadingProps;
  overline?: OverlineProps;
  subline?: SublineProps;
  text?: BaseTextProps;
  videoObjectFit?: 'contain' | 'cover';
  videos: Partial<Record<ScreenSizeOptions, { src: string }>>;
  overlayColor?: string;
  overlayOpacity?: number;
  ctaButton?: ButtonProps;
};

export type VideoHeroStyleProps = {
  $overlayColor: VideoHeroData['overlayColor'];
  $overlayOpacity: VideoHeroData['overlayOpacity'];
};

export type VideoSizeOptions = ScreenSizeOptions;

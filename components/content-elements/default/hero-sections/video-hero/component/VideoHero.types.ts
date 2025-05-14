import { CSSProperties, ReactNode } from 'react';
import { HeadingProps } from '../../../text/heading';
import { OverlineProps } from '../../../text/overline';
import { SublineProps } from '../../../text/subline';
import { ScreenSizeOptions } from '../../../types';
import { BaseTextProps } from '../../../text/base-text';
import { ButtonProps } from '../../../button/button';

export type VideoHeroProps = {
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
  $overlayColor: VideoHeroProps['overlayColor'];
  $overlayOpacity: VideoHeroProps['overlayOpacity'];
};

export type VideoSizeOptions = ScreenSizeOptions;

import { ReactNode } from 'react';
import { ButtonProps } from '../../../../default';
import { AlignOptions } from '../../../types';

export type IntroTextProps = {
  children?: ReactNode;
  textColor?: string;
  ctaButton?: Partial<ButtonProps>;
  align?: AlignOptions;
  className?: string;
};

export type IntroTextStyleProps = {
  $textColor?: IntroTextProps['textColor'];
  $align?: IntroTextProps['align'];
};

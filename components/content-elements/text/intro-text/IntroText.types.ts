import { CSSProperties, ReactNode } from 'react';
import { ButtonProps } from '../button/Button.types';

export type IntroTextProps = {
  children?: string | ReactNode;
  heading?: string | ReactNode;
  headingType?: 'h1' | 'h2' | 'h3';
  backgroundColor?: string;
  textColor?: string;
  ctaButton?: Partial<ButtonProps>;
  className?: string;
  style?: CSSProperties;
  margin?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  width?: 'small' | 'medium' | 'large';
  innerWidth?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
};

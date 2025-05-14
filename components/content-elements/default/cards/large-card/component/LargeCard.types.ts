import { ReactNode } from 'react';

import { WrapperProps } from '../../../layout/wrapper';
import { ButtonProps } from '../../../button/button';

export type LargeCardProps = {
  children?: string | ReactNode;
  cardBackgroundColor?: string;
  textColor?: string;
  highlightColor?: string | null;
  backgroundImage?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  viewportTriggerOnce?: boolean;
  ctaButton?: ButtonProps[];
  overlay?: 'none' | 'dark-gradient';
  unwrapped?: boolean;
} & WrapperProps;

export type LargeCardStyleProps = {
  $isInViewport: boolean;
  $isActive?: boolean;
  $cardBackgroundColor?: string;
  $textColor?: string;
  $highlightColor: string;
};

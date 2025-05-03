import { ReactNode } from 'react';

import { WrapperStyleProps } from '../../../layout/wrapper/component';
import { ButtonProps } from '../../../button/button';

export type LargeCardProps = {
  children?: string | ReactNode;
  className?: string;
  $cardBackgroundColor?: string;
  $backgroundImage?: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  $textColor?: string;
  overlay?: 'none' | 'dark-gradient';
  ariaLabel?: string;
  animationOnce?: boolean;
  isHighlighted?: boolean;
  $highlightedTextBackgroundColor?: string | null;
  ctaButton?: ButtonProps[];
} & WrapperStyleProps;

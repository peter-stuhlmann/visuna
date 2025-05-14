import { ReactNode } from 'react';

import { WrapperProps } from '../../../layout/wrapper/component';
import { ButtonProps } from '../../../button/button';
import { ImageProps } from '../../../images/image';
import { HeadingProps } from '../../heading';
import { OverlineProps } from '../../overline';

export type ImageTextProps = {
  children?: string | ReactNode;
  className?: string;
  image?: ImageProps;
  heading?: HeadingProps;
  overline?: OverlineProps;
  textColor?: string;
  ctaButton?: Partial<ButtonProps> | null;
  imagePosition?: 'left' | 'right';
  unwrapped?: boolean;
} & WrapperProps;

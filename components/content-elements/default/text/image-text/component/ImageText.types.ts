import { ReactNode } from 'react';

import { WrapperStyleProps } from '../../../layout/wrapper/component';
import { ButtonProps } from '../../../button/button';
import { ImageProps } from '../../../images/image';

export type ImageTextProps = {
  children?: string | ReactNode;
  className?: string;
  image?: ImageProps;
  heading?: string | ReactNode;
  headingType?: 'h1' | 'h2' | 'h3';
  subHeading?: string | ReactNode;
  ctaButton?: Partial<ButtonProps> | null;
  $imagePosition?: 'left' | 'right';
} & WrapperStyleProps;

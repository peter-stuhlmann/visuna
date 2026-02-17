import { ReactNode } from 'react';
import { ButtonProps } from '../../core/button';
import { ImageProps } from '../../core/image';

export type ImageTextProps = {
  data?: ImageTextData;
};

export type ImageTextData = {
  children: string | ReactNode;
  className?: string;
  image?: ImageProps;
  textColor?: string;
  ctaButton?: Partial<ButtonProps> | null;
  imagePosition: 'left' | 'right';
};

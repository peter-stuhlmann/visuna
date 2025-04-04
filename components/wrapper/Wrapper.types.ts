import { ReactNode } from 'react';

export type WrapperProps = {
  children: ReactNode;
  theme?: 'light' | 'dark' | 'default';
  withShadow?: boolean;
  width?: 'small' | 'medium' | 'large';
  innerWidth?: 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  textAlign?: 'left' | 'center' | 'right';
};

export type ContainerProps = {
  $withShadow: boolean;
  $width?: 'small' | 'medium' | 'large';
  $theme?: 'light' | 'dark' | 'default';
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $innerWidth?: 'small' | 'medium' | 'large';
  $textAlign?: 'left' | 'center' | 'right';
};

import { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { AlignOptions, BorderRadiusOptions } from '../../../types';
import { IconProps } from '../../icons/icon';

export type ButtonProps = {
  children: string | ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'contained' | 'outlined';
  fontWeight?: number;
  margin?: 'none' | 'small' | 'medium' | 'large';
  primaryColor?: Record<string, string>;
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  prefetch?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  disabledRipple?: boolean;
  textColor?: string;
  borderRadius?: BorderRadiusOptions;
  ariaLabel?: string;
  tabIndex?: number;
  type?: 'button' | 'submit' | 'reset';
  icon?: IconProps;
  iconPosition?: 'start' | 'end';
  gap?: string;
  fullWidth?: boolean;
  align?: AlignOptions;
  disabled?: boolean;
  showOnlyIconOnMobile?: boolean;
};

export type ButtonStyleProps = {
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'text' | 'contained' | 'outlined';
  $fontWeight?: number;
  $speed?: number;
  $primaryColor: Record<string, string>;
  $textColor?: string;
  $borderRadius?: ButtonProps['borderRadius'];
  $iconPosition?: 'start' | 'end';
  $gap?: ButtonProps['gap'];
  $fullWidth?: ButtonProps['fullWidth'];
  $align?: ButtonProps['align'];
  $disabled?: ButtonProps['disabled'];
  $showOnlyIconOnMobile?: ButtonProps['showOnlyIconOnMobile'];
};

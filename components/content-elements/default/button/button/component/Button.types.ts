import { CSSProperties, ReactNode } from 'react';
import { IconName } from '../../../icons/icon/component/Icon.types';

export type ButtonProps = {
  children: string | ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'contained' | 'outlined';
  fontWeight?: number;
  margin?: 'none' | 'small' | 'medium' | 'large';
  primaryColor?: Record<string, string>;
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  disabledRipple?: boolean;
  textColor?: string;
  ariaLabel?: string;
  tabIndex?: number;
  type?: 'button' | 'submit' | 'reset';
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  gap?: string;
};

export type ButtonStyleProps = {
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'text' | 'contained' | 'outlined';
  $fontWeight?: number;
  $speed?: number;
  $primaryColor: Record<string, string>;
  $textColor?: string;
  $iconPosition?: 'start' | 'end';
  $gap?: ButtonProps['gap'];
};

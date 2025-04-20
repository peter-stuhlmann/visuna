import { CSSProperties, ReactNode } from 'react';

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
  $textColor?: string;
};

import { ReactNode } from 'react';

type SubFooterContent =
  | { dangerouslySetInnerHTML: { __html: string }; children?: never }
  | { children: ReactNode; dangerouslySetInnerHTML?: never };

export type SubFooterProps = {
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  element?: 'div' | 'footer';
} & SubFooterContent;

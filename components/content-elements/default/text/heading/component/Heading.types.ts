import { ReactNode } from 'react';

export type HeadingProps = {
  children?: string | ReactNode;
  level?: 'h1' | 'h2' | 'h3';
};

export type HeadingStylingProps = {
  $level: HeadingProps['level'];
};

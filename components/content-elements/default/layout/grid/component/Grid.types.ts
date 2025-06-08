import { ReactNode } from 'react';

export type GridProps = {
  children: ReactNode;
  columns?: number;
};

export type GridStyleProps = {
  $columns?: GridProps['columns'];
};

import { CSSProperties } from 'react';
import { SizeOptions } from '../../../types';

export type SpacerProps = {
  className?: string;
  style?: CSSProperties;
  size?: SizeOptions;
  backgroundColor?: string;
};

export type SpacerStyleProps = {
  $size?: SpacerProps['size'];
  $backgroundColor?: string;
};

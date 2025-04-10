import { CSSProperties } from 'react';

export type SpacerProps = {
  className?: string;
  style?: CSSProperties;
} & SpacerStylingProps;

export type SpacerStylingProps = {
  $size?: 'none' | 'small' | 'medium' | 'large';
  $backgroundColor?: string;
};

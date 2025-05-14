import { ReactNode } from 'react';
import { ScreenSizeOptions } from '../../../types';

export type VideoProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode | string;
  objectFit?: 'contain' | 'cover';
  videos: Partial<Record<ScreenSizeOptions, { src: string }>>;
};

export type VideoStyleProps = {
  $objectFit: VideoProps['objectFit'];
};

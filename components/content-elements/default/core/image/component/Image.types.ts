import { StaticImageData } from 'next/image';

export type ImageProps = {
  src: string | StaticImageData;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  copyright?: string;
  caption?: string;
  className?: string;
  $backgroundColor?: string;
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $padding?: 'none' | 'small' | 'medium' | 'large';
};

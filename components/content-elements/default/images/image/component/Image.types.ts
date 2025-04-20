export type ImageProps = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  copyright?: string;
  caption?: string;
  className?: string;
  $backgroundColor?: string;
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $padding?: 'none' | 'small' | 'medium' | 'large';
};

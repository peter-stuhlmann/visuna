export type GridItem = {
  image: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

export type LogoGridProps = {
  items: GridItem[];
  className?: string;
  $innerWidth?: 'small' | 'medium' | 'large';
  $backgroundColor?: string;
  $textColor?: string;
  unwrapped?: boolean;
};

import { LogoGridData, None, SizeOptions } from '../../../types';

export type GridItemProps = {
  image: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

export type LogoGridProps = LogoGridData;

export type LogoGridStyleProps = {
  $itemsGap?: LogoGridProps['itemsGap'];
  $itemsPerRow: number;
};

export type LogoGridItemGapOptions = SizeOptions | 'xs' | None;

export type LogoGridItemStyleProps = {
  $backgroundColor?: LogoGridProps['itemBackgroundColor'];
  $borderRadius?: LogoGridProps['itemBorderRadius'];
  $borderColor?: LogoGridProps['itemBorderColor'];
  $aspectRatio?: LogoGridProps['itemAspectRatio'];
};

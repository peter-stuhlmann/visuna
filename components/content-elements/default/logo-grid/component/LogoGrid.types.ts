import { BorderRadiusOptions, None, SizeOptions } from '../../types';

export type GridItemProps = {
  image: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

export type LogoGridData = {
  items: GridItemProps[];
  itemsGap?: LogoGridItemGapOptions;
  itemsPerRow?: number;
  itemBackgroundColor?: string;
  itemBorderRadius?: BorderRadiusOptions;
  itemBorderColor?: string;
  itemAspectRatio?:
    | 'auto'
    | '1/1'
    | '3/2'
    | '2/3'
    | '4/3'
    | '3/4'
    | '2/1'
    | '1/2';
};

export type LogoGridProps = { data: LogoGridData };

export type LogoGridStyleProps = {
  $itemsGap?: LogoGridData['itemsGap'];
  $itemsPerRow: number;
};

export type LogoGridItemGapOptions = SizeOptions | 'xs' | None;

export type LogoGridItemStyleProps = {
  $backgroundColor?: LogoGridData['itemBackgroundColor'];
  $borderRadius?: LogoGridData['itemBorderRadius'];
  $borderColor?: LogoGridData['itemBorderColor'];
  $aspectRatio?: LogoGridData['itemAspectRatio'];
};

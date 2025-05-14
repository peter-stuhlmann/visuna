import { WrapperProps } from '../../../layout/wrapper';
import { BorderRadiusOptions, None, SizeOptions } from '../../../types';

export type GridItemProps = {
  image: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
};

export type LogoGridProps = {
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
  unwrapped?: boolean;
} & WrapperProps;

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

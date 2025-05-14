import { CSSProperties, ReactNode, Ref } from 'react';
import {
  BorderRadiusOptions,
  InnerBorderRadiusOptions,
  InnerWidthOptions,
  MarginOptions,
  PaddingOptions,
  WidthOptions,
} from '../../../types';
import { OverlineProps } from '../../../text/overline';
import { HeadingProps } from '../../../text/heading';
import { SublineProps } from '../../../text/subline';

export type WrapperStyleProps = {
  $width: WrapperProps['width'];
  $innerWidth: WrapperProps['innerWidth'];
  $marginTop: WrapperProps['marginTop'];
  $marginBottom: WrapperProps['marginBottom'];
  $padding: WrapperProps['padding'];
  $backgroundColor: WrapperProps['backgroundColor'];
  $borderRadius: WrapperProps['borderRadius'];
  $innerBorderRadius: WrapperProps['innerBorderRadius'];
};

export type WrapperProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  element?: 'section' | 'div' | 'header' | 'footer';
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  width?: WidthOptions;
  innerWidth?: InnerWidthOptions;
  borderRadius?: BorderRadiusOptions;
  innerBorderRadius?: InnerBorderRadiusOptions;
  marginBottom?: MarginOptions;
  marginTop?: MarginOptions;
  padding?: PaddingOptions;
  backgroundColor?: string;
  elementOverline?: OverlineProps;
  elementHeading?: HeadingProps;
  elementSubline?: SublineProps;
  unwrapped?: boolean;
};

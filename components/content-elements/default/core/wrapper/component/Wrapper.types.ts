import { CSSProperties, ReactNode, Ref } from 'react';
import { BasePageElementData } from '../../../types';

export type WrapperStyleProps = {
  $outerWidth?: string;
  $innerWidth?: string;
  $outerMarginTop?: string;
  $outerMarginBottom?: string;
  $innerPaddingTop?: string;
  $innerPaddingRight?: string;
  $innerPaddingBottom?: string;
  $innerPaddingLeft?: string;
  $outerPaddingTop?: string;
  $outerPaddingRight?: string;
  $outerPaddingBottom?: string;
  $outerPaddingLeft?: string;
  $outerBackgroundColor?: string;
  $innerBackgroundColor?: string;
  $outerBorderRadius?: string;
  $innerBorderRadius?: string;
};

export type WrapperProps = {
  data?: {
    id?: string;
    children: ReactNode;
    layout: BasePageElementData['layout'];
  };
  className?: string;
};

export type WrapperPropsFromData = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  element?: 'section' | 'div' | 'header' | 'footer';
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  data: BasePageElementData;
};

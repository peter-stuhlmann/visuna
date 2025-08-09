import { CSSProperties, ReactNode, Ref } from 'react';
import { BasePageElementData } from '../../../types';

export type WrapperStyleProps = {
  $width: BasePageElementData['width'];
  $innerWidth: BasePageElementData['innerWidth'];
  $marginTop: BasePageElementData['marginTop'];
  $marginBottom: BasePageElementData['marginBottom'];
  $paddingTop: BasePageElementData['paddingTop'];
  $paddingBottom: BasePageElementData['paddingBottom'];
  $paddingLeft: BasePageElementData['paddingLeft'];
  $paddingRight: BasePageElementData['paddingRight'];
  $backgroundColor: BasePageElementData['backgroundColor'];
  $borderRadius: BasePageElementData['borderRadius'];
  $innerBorderRadius: BasePageElementData['innerBorderRadius'];
};

export type WrapperProps = {
  data?: BasePageElementData;
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

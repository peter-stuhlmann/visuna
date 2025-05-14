import { AlignOptions, FontWeightOptions } from '../../../types';

export type BaseTextProps = {
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  align?: AlignOptions;
  color?: string;
  fontWeight?: FontWeightOptions;
  element?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  value?: string;
};

export type BaseTextStyleProps = {
  $textTransform: BaseTextProps['textTransform'];
  $align: BaseTextProps['align'];
  $color: BaseTextProps['color'];
  $fontWeight: BaseTextProps['fontWeight'];
};

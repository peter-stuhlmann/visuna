export type BaseTextElementProps = {
  value?: string;
  textColor?: string;
  highlightColor?: string;
};

export type OverlineProps = BaseTextElementProps;
export type SublineProps = BaseTextElementProps;

export type MarginOptions = SizeOptions | None;
export type PaddingOptions = SizeOptions | None;
export type WidthOptions = SizeOptions | Full;
export type InnerWidthOptions = SizeOptions | Full;
export type BorderRadiusOptions = SizeOptions | Full | None;
export type InnerBorderRadiusOptions = BorderRadiusOptions;
export type SizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type AlignOptions = 'left' | 'center' | 'right' | 'justify';
export type FontWeightOptions = 'normal' | 'bold';
export type Full = 'full';
export type None = 'none';
export type ScreenSizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl' | '3xl' | '4xl';

export type Status = 'success' | 'error' | 'warning' | 'default';

export type Role = 'admin' | 'redakteur';

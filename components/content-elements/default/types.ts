import { ButtonProps } from './core/button';

// 1. Basisstruktur für alle Page-Elemente
export type Align = 'left' | 'center' | 'right' | 'justify';
export type Size = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type Full = 'full';
export type None = 'none';
export type Width = Size | Full;
export type Margin = Size | None;
export type Padding = Size | None;
export type BorderRadius = Size | Full | None;
export type AnimationDuration = 'fast' | 'normal' | 'slow';

export type BasePageElementData = {
  children?: React.ReactNode;
  id?: string;
  layout: {
    outerWidth?: Width;
    innerWidth?: Width;
    outerMarginTop?: Margin;
    outerMarginBottom?: Margin;
    outerPaddingTop?: Padding;
    outerPaddingBottom?: Padding;
    outerPaddingLeft?: Padding;
    outerPaddingRight?: Padding;
    innerPaddingTop?: Padding;
    innerPaddingBottom?: Padding;
    innerPaddingLeft?: Padding;
    innerPaddingRight?: Padding;
    outerBackgroundColor?: string;
    innerBackgroundColor?: string;
    outerBorderRadius?: BorderRadius;
    innerBorderRadius?: BorderRadius;
    unwrapped?: boolean;
    element?: 'section' | 'div' | 'header' | 'footer';
  };
  prime?: boolean;
};

import { LocalizedString } from './utils/i18n';

// 2. Gemeinsame Typografie-Props für Element
export type TypographyProps = {
  introContent?: LocalizedString;
  textColor?: string;
  textAlign?: Align;
};

export type LargeCardData = BasePageElementData &
  TypographyProps & {
    backgroundImage?: {
      src: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    cardBackgroundColor?: string;
    textColor?: string;
    highlightColor?: string | null;
    overlay?: 'none' | 'dark-gradient';
    ctaButton?: Array<{
      children: string;
      textColor?: ButtonProps['textColor'];
      variant?: ButtonProps['variant'];
      primaryColor?: ButtonProps['primaryColor'];
      onClick?: ButtonProps['onClick'];
    }>;
  };

export type FieldComponentProps<T> = {
  name: string;
  value: T;
  onChange: (value: T) => void;
};

export interface PageElementData {
  [key: string]: unknown;
}

// // Generische Optionen
export type SizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type ScreenSizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl' | '3xl' | '4xl';
export type AlignOptions = 'left' | 'center' | 'right' | 'justify';

export type MarginOptions = SizeOptions | None;
export type PaddingOptions = SizeOptions | None;
export type InnerWidthOptions = SizeOptions | Full;
export type BorderRadiusOptions = SizeOptions | Full | None;
// export type InnerBorderRadiusOptions = BorderRadiusOptions;

// // Status & Rollen
export type Status = 'success' | 'error' | 'warning' | 'default';
export type Role = 'superadmin' | 'admin' | 'editor' | 'read-only';

// // Primitive
// export type Any = string | number | boolean;

// // --------------------------------------------------
// // Gemeinsame Wrapper-Props für alle PageElemente
// // --------------------------------------------------
// export type BasePageElementData = {
//   element?: 'section' | 'div' | 'header' | 'footer';
//   id?: string;
//   width?: WidthOptions;
//   innerWidth?: InnerWidthOptions;
//   marginTop?: MarginOptions;
//   marginBottom?: MarginOptions;
//   paddingTop?: PaddingOptions;
//   paddingBottom?: PaddingOptions;
//   paddingLeft?: PaddingOptions;
//   paddingRight?: PaddingOptions;
//   backgroundColor?: string;
//   borderRadius?: BorderRadiusOptions;
//   innerBorderRadius?: InnerBorderRadiusOptions;
//   unwrapped?: boolean;
//   backgroundImage?: {
//     src: string;
//     alt?: string;
//     width?: number;
//     height?: number;
//   };
//   children?: ReactNode;
//   listItems?: { label?: string; value?: string }[];
//   iconLinks?: {
//     icon: ReactNode | null;
//     href?: string;
//     target?: '_self' | '_blank';
//     variant?: 'text' | 'outlined' | 'contained';
//     ariaLabel?: string;
//   }[];
//   viewportTriggerOnce?: boolean;
// } & ElementTypographyProps;

export type ElementTypographyProps = {
  introContent?: LocalizedString;
};

export type ElementInnerTypographyProps = {
  elementIntroContent?: LocalizedString;
};

// Beispielhafte Typdefinitionen für das UI

export type FieldKey = keyof FieldTypeMap;

export type FieldTypeMap = {
  [key: string]: string | number | boolean | object | undefined;
};

export type AllElementData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

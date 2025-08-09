import { ObjectId } from 'mongodb';
import { ButtonProps } from './button/button';
import { ListItemProps } from './list/list/component/List.types';
import { IconName } from './icons/icon/component/Icon.types';
import {
  GridItemProps,
  LogoGridItemGapOptions,
} from './list/logo-grid/component/LogoGrid.types';

// 1. Basisstruktur für alle Page-Elemente
export type Align = 'left' | 'center' | 'right' | 'justify';
export type Size = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type Full = 'full';
export type None = 'none';
export type Width = Size | Full;
export type Margin = Size | None;
export type Padding = Size | None;
export type BorderRadius = Size | Full | None;

export type BasePageElementData = {
  children?: React.ReactNode;
  id?: string;
  element?: 'section' | 'div' | 'header' | 'footer';
  width?: Width;
  innerWidth?: Width;
  marginTop?: Margin;
  marginBottom?: Margin;
  paddingTop?: Padding;
  paddingBottom?: Padding;
  paddingLeft?: Padding;
  paddingRight?: Padding;
  backgroundColor?: string;
  borderRadius?: BorderRadius;
  innerBorderRadius?: BorderRadius;
  unwrapped?: boolean;
};

// 2. Gemeinsame Typografie-Props für Elemente
export type TypographyProps = {
  overline?: string;
  heading?: string;
  subline?: string;
  overlineColor?: string;
  headingColor?: string;
  sublineColor?: string;
  textColor?: string;
  overlineAlign?: Align;
  headingAlign?: Align;
  sublineAlign?: Align;
  textAlign?: Align;
  overlineElement?: 'div' | 'span';
  headingElement?: 'h1' | 'h2' | 'h3' | 'h4';
  sublineElement?: 'div' | 'span';
};

// 3. Element-spezifische Typen
export type IntroTextData = TypographyProps & {
  ctaButton?: ButtonProps;
  children?: React.ReactNode;
};

export type ContactMapData = BasePageElementData &
  TypographyProps &
  ElementInnerTypographyProps & {
    address?: string;
    map?: {
      center: { lat: number; lng: number };
      zoom: number;
      markers?: { lat: number; lng: number }[];
    };
    iconLinks?: ButtonProps[];
    imagePosition?: 'right' | 'left';
    textColor?: string;
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

export type MetricsData = BasePageElementData & {
  metrics: Array<{ label: string; value: number | string }>;
  animated?: boolean;
  animationOnce?: boolean;
  animationDuration?: number;
};

export type SpacerData = {
  size: Size;
};

// 4. Mapping aller Elemente
export type ElementTypeToDataMap = {
  'contact-map': ContactMapData;
  'intro-text': IntroTextData;
  metrics: MetricsData;
  spacer: SpacerData;
};

// 5. Union-Typ für alle Daten
// export type AllElementData = ElementTypeToDataMap[keyof ElementTypeToDataMap];

// // 6. PageElement Objekt (z. B. aus DB)
// export type PageElement = {
//   _id: string;
//   pageId: string;
//   name: string;
//   order: number;
//   element: string;
//   data: PageElementData;
// };

// // 7. Optional: Feld-Mapping für dynamische Formulare
// export type FieldTypeMap = {
//   [key: string]: string | number | boolean | undefined | null | object;
// };

export type FieldComponentProps<T> = {
  name: string;
  value: T;
  onChange: (value: T) => void;
};

export interface PageElementData {
  [key: string]: unknown;
}

// import { ReactNode } from 'react';
// import { ObjectId } from 'mongodb';
// import { ImageProps } from './images/image';
// import { MapLeafletProps } from './map/map/component/Map.types';
// import { ButtonProps } from './button/button';
// import { BaseTextProps } from './text/base-text';
// import { ListItemProps } from './list/list/component/List.types';
// import { IconName } from './icons/icon/component/Icon.types';
// import {
//   GridItemProps,
//   LogoGridItemGapOptions,
// } from './list/logo-grid/component/LogoGrid.types';

// // Generische Optionen
export type SizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl';
export type ScreenSizeOptions = 's' | 'm' | 'l' | 'xl' | 'xxl' | '3xl' | '4xl';
export type AlignOptions = 'left' | 'center' | 'right' | 'justify';

// export type Full = 'full';
// export type None = 'none';

export type MarginOptions = SizeOptions | None;
export type PaddingOptions = SizeOptions | None;
export type InnerWidthOptions = SizeOptions | Full;
export type BorderRadiusOptions = SizeOptions | Full | None;
// export type InnerBorderRadiusOptions = BorderRadiusOptions;

// // Status & Rollen
export type Status = 'success' | 'error' | 'warning' | 'default';
export type Role = 'admin' | 'redakteur';

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
  overlineValue?: string;
  overlineTextColor?: string;
  overlineTextAlign?: AlignOptions;
  overlineElement?: 'div' | 'span';
  headingValue?: string;
  headingTextColor?: string;
  headingTextAlign?: AlignOptions;
  headingElement?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  sublineValue?: string;
  sublineTextColor?: string;
  sublineTextAlign?: AlignOptions;
  sublineElement?: 'div' | 'span';
};

export type ElementInnerTypographyProps = {
  elementOverlineValue?: string;
  elementOverlineTextColor?: string;
  elementOverlineTextAlign?: AlignOptions;
  elementOverlineElement?: 'div' | 'span';
  elementHeadingValue?: string;
  elementHeadingTextColor?: string;
  elementHeadingTextAlign?: AlignOptions;
  elementHeadingElement?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  elementSublineValue?: string;
  elementSublineTextColor?: string;
  elementSublineTextAlign?: AlignOptions;
  elementSublineElement?: 'div' | 'span';
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

export type PageElement = {
  _id: string;
  element: string;
  name: string;
  order: number;
  data: AllElementData;
};

export type DBPageElement = {
  order?: number;
  _id: ObjectId;
  name: string;
  element: string;
  pageId: ObjectId;
  data?: AllElementData;
};

// export type ContactMapData = BasePageElementData &
//   ElementInnerTypographyProps & {
//     children?: ReactNode;
//     textColor?: string;
//     image?: ImageProps;
//     imagePosition?: 'left' | 'right';
//     map?: MapLeafletProps;
//     iconLinks?:
//       | {
//           icon: ReactNode | null;
//           href?: string;
//           target?: '_self' | '_blank';
//           variant?: 'text' | 'outlined' | 'contained';
//           ariaLabel?: string;
//         }[]
//       | null;
//     address?: { label?: string; value?: string }[];
//   };

// export type IntroTextData = BasePageElementData &
//   ElementInnerTypographyProps & {
//     children?: ReactNode;
//     textColor?: string;
//     ctaButton?: Partial<ButtonProps>;
//     align?: AlignOptions;
//   };

// export type LargeCardData = BasePageElementData & {
//   backgroundImage?: {
//     src: string;
//     alt?: string;
//     width?: number;
//     height?: number;
//   };
//   cardBackgroundColor?: string;
//   textColor?: string;
//   highlightColor?: string | null;
//   overlay?: 'none' | 'dark-gradient';
//   ctaButton?: Array<{
//     children: string;
//     textColor?: ButtonProps['textColor'];
//     variant?: ButtonProps['variant'];
//     primaryColor?: ButtonProps['primaryColor'];
//     onClick?: ButtonProps['onClick'];
//   }>;
// };

export type ListData = {
  items: ListItemProps[];
  textColor?: string;
  highlightColor?: string;
  defaultIcon?: IconName;
  defaultIconColor?: string;
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

// export type MetricsData = BasePageElementData & {
//   metrics: Array<{ label: string; value: number | string }>;
//   animated?: boolean;
//   animationOnce?: boolean;
//   animationDuration?: number;
// };

// export type SpacerData = {
//   size?: SizeOptions;
// };

// export type VideoHeroData = BasePageElementData &
//   ElementInnerTypographyProps & {
//     className?: string;
//     children?: ReactNode | string;
//     text?: BaseTextProps;
//     videoObjectFit?: 'contain' | 'cover';
//     videos: Partial<Record<ScreenSizeOptions, { src: string }>>;
//     overlayColor?: string;
//     overlayOpacity?: number;
//     ctaButton?: ButtonProps;
//   };

// export type ElementTypeToDataMap = {
//   'intro-text': IntroTextData;
//   metrics: MetricsData;
//   'large-card': LargeCardData;
//   'contact-map': ContactMapData;
//   spacer: SpacerData;
// };

// export type PageElementData = ElementTypeToDataMap[keyof ElementTypeToDataMap];

// export type PageElement<
//   T extends keyof ElementTypeToDataMap = keyof ElementTypeToDataMap
// > = {
//   order?: number;
//   _id: string;
//   name: string;
//   element: T;
//   pageId: string;
//   data?: ElementTypeToDataMap[T];
// };

// export type ElementData<T extends keyof ElementTypeToDataMap> =
//   ElementTypeToDataMap[T];

// export type DBPageElement<
//   T extends keyof ElementTypeToDataMap = keyof ElementTypeToDataMap
// > = {
//   order?: number;
//   _id: ObjectId;
//   name: string;
//   element: T;
//   pageId: ObjectId;
//   data?: ElementTypeToDataMap[T];
// };

// export type AllElementData = ElementTypeToDataMap[keyof ElementTypeToDataMap];
// export type CommonFieldKeys = Extract<keyof AllElementData, keyof FieldTypeMap>;

// export type FieldTypeMap = {
//   address: { label: string; value: string }[];
//   backgroundColor?: string;
//   borderRadius?: BorderRadiusOptions;
//   children?: string;
//   className?: string;
//   element?: string;
//   elementSublineValue?: string;
//   elementHeadingValue?: string;
//   elementOverlineValue?: string;
//   heading?: string;
//   headingTextColor?: string;
//   headingValue?: string;
//   innerBorderRadius?: BorderRadiusOptions;
//   innerWidth?: string;
//   map?: {
//     zoom: number;
//     center: { lat: number; lng: number };
//     markers: { lat: number; lng: number }[];
//   };
//   marginBottom?: MarginOptions;
//   marginLeft?: MarginOptions;
//   marginRight?: MarginOptions;
//   marginTop?: MarginOptions;
//   overlineValue?: string;
//   paddingBottom?: PaddingOptions;
//   paddingLeft?: PaddingOptions;
//   paddingRight?: PaddingOptions;
//   paddingTop?: PaddingOptions;
//   size?: SizeOptions;
//   sublineValue?: string;
//   textAlign?: AlignOptions;
//   textTransform?: 'none' | 'uppercase' | 'lowercase';
//   value?: string;
//   width?: WidthOptions;
// };

// export type FieldComponentProps<T> = {
//   name: string;
//   value: T;
//   onChange: (value: T) => void;
// };

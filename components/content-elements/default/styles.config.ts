import { LogoGridItemGapOptions } from './logo-grid/component/LogoGrid.types';
import {
  AnimationDuration,
  BorderRadiusOptions,
  InnerWidthOptions,
  MarginOptions,
  Role,
  ScreenSizeOptions,
  Status,
  Width,
} from './types';

export const animationDurationMap: Record<AnimationDuration, number> = {
  fast: 1200,
  normal: 2500,
  slow: 4000,
};

export const widthMap: Record<Width, string> = {
  s: '480px',
  m: '768px',
  l: '1024px',
  xl: '1280px',
  xxl: '1440px',
  full: '100%',
};

export const marginMap: Record<MarginOptions, string> = {
  none: '0',
  s: '1rem',
  m: '2rem',
  l: '4rem',
  xl: '8rem',
  xxl: '12rem',
};

export const paddingMap: Record<string, string> = {
  none: '0',
  s: '2rem',
  m: '4rem 3rem',
  l: '8rem 5rem',
};

export const paddingXMap: Record<MarginOptions, string> = {
  none: '0',
  s: '1rem',
  m: '2rem',
  l: '4rem',
  xl: '8rem',
  xxl: '12rem',
};

// export const paddingMobileMap: Record<string, string> = {
//   none: '0',
//   s: '1rem',
//   m: '4rem 1rem',
//   l: '8rem 1rem',
// };

export const innerWidthMap: Record<InnerWidthOptions, string> = {
  s: '480px',
  m: '768px',
  l: '1024px',
  xl: '1280px',
  xxl: '1440px',
  full: '100%',
};

export const borderRadiusMap: Record<BorderRadiusOptions, string> = {
  none: '0',
  s: '0.25rem',
  m: '0.5rem',
  l: '1rem',
  xl: '1.5rem',
  xxl: '2rem',
  full: '1000px',
};

export const logoGridItemGapMap: Record<LogoGridItemGapOptions, string> = {
  none: 'none',
  xs: '0.25rem',
  s: '0.5rem',
  m: '1rem',
  l: '2rem',
  xl: '4rem',
  xxl: '8rem',
};

export const screenSizeMap: Record<ScreenSizeOptions, number> = {
  s: 480,
  m: 768,
  l: 1024,
  xl: 1280,
  xxl: 1440,
  '3xl': 1920,
  '4xl': 2560,
};

// BACKEND

export const roleColorMap: Record<Role, string> = {
  superadmin: '#ff6b6b',
  admin: '#00ffd9',
  editor: '#ffeb00',
  'read-only': '#a0a0a0',
};

export const statusColorsMap: Record<Status, string> = {
  default: '#ccc',
  success: 'green',
  error: '#ff0000',
  warning: '#ff9900',
};

export const selectInputPaddingMap: Record<
  'small' | 'medium' | 'large',
  string
> = {
  small: '0 7px',
  medium: '0 0.9rem',
  large: '0 1.25rem',
};

export const inputSizeMap: Record<'small' | 'medium' | 'large', string> = {
  small: '26px',
  medium: '35px',
  large: '54px',
};

export const inputLabelLeftMap: Record<'small' | 'medium' | 'large', string> = {
  small: '5px',
  medium: '0.8rem',
  large: '1rem',
};

export const selectBorderRadiusMap: Record<
  'small' | 'medium' | 'large',
  string
> = {
  small: '4px',
  medium: '0.5rem',
  large: '1rem',
};

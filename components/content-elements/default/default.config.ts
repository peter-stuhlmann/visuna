import customConfig from '@/custom.config';
import colors from './constants/colors';
import { ColorDefinition } from './constants/colors/colors.types';

export type ContentElementsConfig = {
  classPrefix: string;
  primaryColor: ColorDefinition;
  rippleSpeed: number;
  fontSize: string;
};

export const defaultConfig: ContentElementsConfig = {
  classPrefix: 'psui',
  primaryColor: colors.SLATE,
  rippleSpeed: 700,
  fontSize: '18px',
};

export const mergedConfig: ContentElementsConfig = {
  ...defaultConfig,
  ...customConfig,
};

export const getConfig = () => mergedConfig;

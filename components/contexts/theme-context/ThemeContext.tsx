'use client';

import React, { FC, ReactNode } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';

import mergeThemes from '@/components/content-elements/utils/mergeThemes';
import type { Theme } from '@/components/content-elements/types';

type CustomThemeProviderProps = {
  children: ReactNode;
  theme?: Theme;
};

export const CustomThemeProvider: FC<CustomThemeProviderProps> = ({
  children,
  theme,
}) => {
  const mergedTheme = mergeThemes(theme) as Theme;
  return <SCThemeProvider theme={mergedTheme}>{children}</SCThemeProvider>;
};

export default CustomThemeProvider;

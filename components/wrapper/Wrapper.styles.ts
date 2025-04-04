'use client';

import styled, { css } from 'styled-components';
import { ContainerProps } from './Wrapper.types';

const widthMap: Record<string, string> = {
  small: '900px',
  medium: '1440px',
  large: '100%',
};

const themeMap: Record<string, string> = {
  default: 'transparent',
  dark: '#133c59',
  light: '#fff',
};

const marginMap: Record<string, string> = {
  none: '0 auto',
  small: '20px auto',
  medium: '50px auto',
  large: '100px auto',
};

const innerWidthMap: Record<string, string> = {
  small: '1200px',
  medium: '1440px',
  large: '100%',
};

const textAlignMap: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export const Container = styled.div<ContainerProps>`
  background-color: ${({ $theme = 'default' }) => themeMap[$theme]};
  width: 100%;
  max-width: ${({ $width }) =>
    $width ? widthMap[$width] || '1440px' : '1440px'};
  margin: ${({ $margin = 'none' }) => marginMap[$margin]};
  border-radius: ${({ $width }) => ($width === 'large' ? 0 : '4px')};
  ${({ $withShadow = false }) =>
    $withShadow &&
    css`
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
    `};

  @media (max-width: 1440px) {
    border-radius: 0;
  }

  & > div {
    max-width: ${({ $innerWidth = 'medium' }) => innerWidthMap[$innerWidth]};
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;
    text-align: ${({ $textAlign = 'center' }) => textAlignMap[$textAlign]};
  }
`;

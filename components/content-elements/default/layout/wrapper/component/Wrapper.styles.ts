'use client';

import styled, { css } from 'styled-components';

import { ContainerProps } from './Wrapper.types';
import { getFontSize } from '../../../constants';

const FONT_SIZE = getFontSize();

const widthMap: Record<string, string> = {
  small: '900px',
  medium: '1440px',
  large: '100%',
};

const marginMap: Record<string, string> = {
  none: '0 auto',
  small: '20px auto',
  medium: '50px auto',
  large: '100px auto',
};

const paddingMap: Record<string, string> = {
  none: '0',
  small: '1rem',
  medium: '4rem 1rem',
  large: '8rem 1rem',
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

export const Container = styled.section<ContainerProps>`
  position: relative;
  font-size: ${FONT_SIZE};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $textColor }) => $textColor};
  width: 100%;
  max-width: ${({ $width }) => widthMap[$width!]};
  margin: ${({ $margin }) => marginMap[$margin!]};
  border-radius: ${({ $width }) => ($width === 'large' ? 0 : '0.25rem')};
  ${({ $withShadow = false }) =>
    $withShadow &&
    css`
      box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
    `};

  @media (max-width: 1440px) {
    border-radius: 0;
  }

  @media (max-width: 1280px) {
    font-size: 0.875rem;
  }

  & > div {
    max-width: ${({ $innerWidth }) => innerWidthMap[$innerWidth!]};
    padding: ${({ $padding }) => paddingMap[$padding!]};
    box-sizing: border-box;
    margin: 0 auto;
    text-align: ${({ $textAlign }) => textAlignMap[$textAlign!]};
  }
`;

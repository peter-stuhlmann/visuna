'use client';

import styled from 'styled-components';

import { WrapperStyleProps } from './Wrapper.types';
import { mergedConfig } from '../../../default.config';
import {
  borderRadiusMap,
  innerWidthMap,
  marginMap,
  paddingMap,
  paddingMobileMap,
  widthMap,
} from '../../../styles.config';

export const Container = styled.section<WrapperStyleProps>`
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  width: 100%;
  max-width: ${({ $width }) => widthMap[$width!]};
  margin-top: ${({ $marginTop }) => marginMap[$marginTop!]};
  margin-bottom: ${({ $marginBottom }) => marginMap[$marginBottom!]};
  margin-left: auto;
  margin-right: auto;
  border-radius: ${({ $borderRadius }) => borderRadiusMap[$borderRadius!]};

  &.${mergedConfig.classPrefix}-footer-wrapper {
    & > div {
      padding-bottom: 0;
    }
  }

  & > div {
    max-width: ${({ $innerWidth }) => innerWidthMap[$innerWidth!]};
    padding: ${({ $padding }) => paddingMap[$padding!]};
    border-radius: ${({ $innerBorderRadius }) =>
      borderRadiusMap[$innerBorderRadius!]};
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;

    @media (max-width: 768px) {
      padding: ${({ $padding }) => paddingMobileMap[$padding!]};
    }
  }
`;

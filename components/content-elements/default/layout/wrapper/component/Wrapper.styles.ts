'use client';

import styled from 'styled-components';

import { WrapperStyleProps } from './Wrapper.types';
import { mergedConfig } from '../../../default.config';
import {
  borderRadiusMap,
  innerWidthMap,
  marginMap,
  paddingXMap,
  widthMap,
} from '../../../styles.config';

const halve = (value: string) => {
  const match = value.match(/^([\d.]+)([a-z%]+)$/);
  if (!match) return value;
  const [, num, unit] = match;
  return `${parseFloat(num) / 2}${unit}`;
};

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
    padding-top: ${({ $paddingTop }) => paddingXMap[$paddingTop!]};
    padding-right: ${({ $paddingRight }) => paddingXMap[$paddingRight!]};
    padding-bottom: ${({ $paddingBottom }) => paddingXMap[$paddingBottom!]};
    padding-left: ${({ $paddingLeft }) => paddingXMap[$paddingLeft!]};
    border-radius: ${({ $innerBorderRadius }) =>
      borderRadiusMap[$innerBorderRadius!]};
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;

    @media (max-width: 768px) {
      padding-top: ${({ $paddingTop }) => halve(paddingXMap[$paddingTop!])};
      padding-right: ${({ $paddingRight }) =>
        halve(paddingXMap[$paddingRight!])};
      padding-bottom: ${({ $paddingBottom }) =>
        halve(paddingXMap[$paddingBottom!])};
      padding-left: ${({ $paddingLeft }) => halve(paddingXMap[$paddingLeft!])};
    }
  }
`;

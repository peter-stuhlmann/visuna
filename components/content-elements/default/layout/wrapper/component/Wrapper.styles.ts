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
import {
  BorderRadiusOptions,
  InnerWidthOptions,
  MarginOptions,
  PaddingOptions,
  Width,
} from '../../../types';

const halve = (value: string) => {
  if (typeof value !== 'string') return value;
  const match = value.match(/^([\d.]+)([a-z%]+)$/);
  if (!match) return value;
  const [, num, unit] = match;
  return `${parseFloat(num) / 2}${unit}`;
};

export const Container = styled.section<WrapperStyleProps>`
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  width: 100%;
  max-width: ${({ $width }) => widthMap[$width as Width]};
  margin-top: ${({ $marginTop }) => marginMap[$marginTop as MarginOptions]};
  margin-bottom: ${({ $marginBottom }) =>
    marginMap[$marginBottom as MarginOptions]};
  margin-left: auto;
  margin-right: auto;
  border-radius: ${({ $borderRadius }) =>
    borderRadiusMap[$borderRadius as BorderRadiusOptions]};

  &.${mergedConfig.classPrefix}-footer-wrapper {
    & > div {
      padding-bottom: 0;
    }
  }

  & > div {
    max-width: ${({ $innerWidth }) =>
      innerWidthMap[$innerWidth as InnerWidthOptions]};
    padding-top: ${({ $paddingTop }) =>
      paddingXMap[$paddingTop as PaddingOptions]};
    padding-right: ${({ $paddingRight }) =>
      paddingXMap[$paddingRight as PaddingOptions]};
    padding-bottom: ${({ $paddingBottom }) =>
      paddingXMap[$paddingBottom as PaddingOptions]};
    padding-left: ${({ $paddingLeft }) =>
      paddingXMap[$paddingLeft as PaddingOptions]};
    border-radius: ${({ $innerBorderRadius }) =>
      borderRadiusMap[$innerBorderRadius as InnerWidthOptions]};
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;

    @media (max-width: 768px) {
      padding-top: ${({ $paddingTop }) =>
        halve(paddingXMap[$paddingTop as PaddingOptions])};
      padding-right: ${({ $paddingRight }) =>
        halve(paddingXMap[$paddingRight as PaddingOptions])};
      padding-bottom: ${({ $paddingBottom }) =>
        halve(paddingXMap[$paddingBottom as PaddingOptions])};
      padding-left: ${({ $paddingLeft }) =>
        halve(paddingXMap[$paddingLeft as PaddingOptions])};
    }
  }
`;

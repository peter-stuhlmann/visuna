'use client';

import styled from 'styled-components';

import { WrapperStyleProps } from './Wrapper.types';
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
  background-color: ${({ $outerBackgroundColor }) => $outerBackgroundColor};
  width: 100%;
  max-width: ${({ $outerWidth }) => widthMap[$outerWidth as Width]};
  margin-top: ${({ $outerMarginTop }) =>
    marginMap[$outerMarginTop as MarginOptions]};
  margin-bottom: ${({ $outerMarginBottom }) =>
    marginMap[$outerMarginBottom as MarginOptions]};
  margin-left: auto;
  margin-right: auto;
  border-radius: ${({ $outerBorderRadius }) =>
    borderRadiusMap[$outerBorderRadius as BorderRadiusOptions]};
  padding-top: ${({ $outerPaddingTop }) =>
    paddingXMap[$outerPaddingTop as PaddingOptions]};
  padding-right: ${({ $outerPaddingRight }) =>
    paddingXMap[$outerPaddingRight as PaddingOptions]};
  padding-bottom: ${({ $outerPaddingBottom }) =>
    paddingXMap[$outerPaddingBottom as PaddingOptions]};
  padding-left: ${({ $outerPaddingLeft }) =>
    paddingXMap[$outerPaddingLeft as PaddingOptions]};
  box-sizing: border-box;

  & > div {
    background-color: ${({ $innerBackgroundColor }) => $innerBackgroundColor};
    max-width: ${({ $innerWidth }) =>
      innerWidthMap[$innerWidth as InnerWidthOptions]};
    padding-top: ${({ $innerPaddingTop }) =>
      paddingXMap[$innerPaddingTop as PaddingOptions]};
    padding-right: ${({ $innerPaddingRight }) =>
      paddingXMap[$innerPaddingRight as PaddingOptions]};
    padding-bottom: ${({ $innerPaddingBottom }) =>
      paddingXMap[$innerPaddingBottom as PaddingOptions]};
    padding-left: ${({ $innerPaddingLeft }) =>
      paddingXMap[$innerPaddingLeft as PaddingOptions]};
    border-radius: ${({ $innerBorderRadius }) =>
      borderRadiusMap[$innerBorderRadius as InnerWidthOptions]};
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;

    @media (max-width: 768px) {
      padding-top: ${({ $innerPaddingTop }) =>
        halve(paddingXMap[$innerPaddingTop as PaddingOptions])};
      padding-right: ${({ $innerPaddingRight }) =>
        halve(paddingXMap[$innerPaddingRight as PaddingOptions])};
      padding-bottom: ${({ $innerPaddingBottom }) =>
        halve(paddingXMap[$innerPaddingBottom as PaddingOptions])};
      padding-left: ${({ $innerPaddingLeft }) =>
        halve(paddingXMap[$innerPaddingLeft as PaddingOptions])};
    }
  }
`;

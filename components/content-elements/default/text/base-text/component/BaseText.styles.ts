'use client';

import styled from 'styled-components';

import { BaseTextStyleProps } from './BaseText.types';
import { fontWeightMap } from '../../../styles.config';

export const StyledBaseText = styled.p<BaseTextStyleProps>`
  font-weight: ${({ $fontWeight }) => fontWeightMap[$fontWeight!]};
  margin: 0;
  font-family: var(--primary-font);
  width: 100%;
  text-align: ${({ $align }) => $align};
  text-transform: ${({ $textTransform }) => $textTransform};
  color: ${({ $color }) => $color};
  position: relative;
`;

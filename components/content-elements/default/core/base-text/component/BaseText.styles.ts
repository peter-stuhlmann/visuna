'use client';

import styled from 'styled-components';

import { BaseTextStyleProps } from './BaseText.types';

export const StyledBaseText = styled.p<BaseTextStyleProps>`
  margin: 0;
  font-family: var(--primary-font);
  width: 100%;
  text-align: ${({ $align }) => $align};
  text-transform: ${({ $textTransform }) => $textTransform};
  color: ${({ $color }) => $color};
  position: relative;

  & > span {
    display: block;
  }
`;

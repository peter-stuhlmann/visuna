'use client';

import styled from 'styled-components';
import { SpacerStylingProps } from './Spacer.types';

const sizeMap: Record<string, string> = {
  none: '0',
  small: '2rem',
  medium: '4rem',
  large: '8rem',
};

export const SpacerContainer = styled.div<SpacerStylingProps>`
  height: ${({ $size }) => sizeMap[$size!]};
  background-color: ${({ $backgroundColor = 'transparent' }) =>
    $backgroundColor};
  width: 100%;
`;

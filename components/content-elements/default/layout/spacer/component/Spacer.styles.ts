'use client';

import styled from 'styled-components';
import { SpacerStyleProps } from './Spacer.types';
import { marginMap } from '../../../styles.config';

export const SpacerContainer = styled.div<SpacerStyleProps>`
  height: ${({ $size }) => marginMap[$size!]};
  background-color: ${({ $backgroundColor = 'transparent' }) =>
    $backgroundColor};
  width: 100%;
`;

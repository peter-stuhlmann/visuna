'use client';

import styled from 'styled-components';
import { GridStyleProps } from './Grid.types';

export const GridContainer = styled.div<GridStyleProps>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 1rem;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';
import { LogoGridItemStyleProps, LogoGridStyleProps } from './LogoGrid.types';
import { borderRadiusMap, logoGridItemGapMap } from '../../../styles.config';

export const GridWrapper = styled.div<LogoGridStyleProps>`
  display: grid;
  grid-template-columns: repeat(${({ $itemsPerRow }) => $itemsPerRow}, 1fr);
  gap: ${({ $itemsGap }) => logoGridItemGapMap[$itemsGap!]};

  @media (max-width: 1280px) {
    grid-template-columns: repeat(
      ${({ $itemsPerRow }) => ($itemsPerRow > 3 ? 4 : $itemsPerRow)},
      1fr
    );
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(
      ${({ $itemsPerRow }) => ($itemsPerRow > 2 ? 3 : $itemsPerRow)},
      1fr
    );
  }
`;

export const GridItem = styled.div<LogoGridItemStyleProps>`
  &.${mergedConfig.classPrefix + '-'}logo-grid-item {
    aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: ${({ $backgroundColor }) => $backgroundColor};
    border: 1px solid ${({ $borderColor }) => $borderColor};
    border-radius: ${({ $borderRadius }) => borderRadiusMap[$borderRadius!]};

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
`;

'use client';

import styled from 'styled-components';

import { SkeletonStyleProps } from './Skeleton.types';

export const SkeletonContainer = styled.div<SkeletonStyleProps>`
  width: 100%;
  background: #e0e0e0;
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  opacity: 0.7;
  border-radius: 1rem;
  aspect-ratio: 1 / ${({ $width, $height }) => ($width ? $width / $height : 1)};

  @keyframes shimmer {
    0% {
      background-position: 100%;
    }
    100% {
      background-position: -100%;
    }
  }
`;

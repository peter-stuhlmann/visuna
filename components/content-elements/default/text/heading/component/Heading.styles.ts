'use client';

import styled from 'styled-components';

import { HeadingStyleProps } from './Heading.types';
import BaseText from '../../base-text';

const headingLevelMap: Record<string, string> = {
  h1: '2.5rem',
  h2: '2rem',
  h3: '1.5rem',
};

const headingLevelMobileMap: Record<string, string> = {
  h1: '2rem',
  h2: '1.8rem',
  h3: '1.3rem',
};

export const StyledHeading = styled(BaseText)<HeadingStyleProps>`
  margin: 1rem 0;
  font-family: var(--secondary-font);
  width: 100%;
  color: ${({ $color }) => $color};
  text-align: ${({ $align }) => $align};
  text-transform: ${({ $textTransform }) => $textTransform};
  font-weight: ${({ $fontWeight }) => $fontWeight};
  position: relative;
  font-size: ${({ as }) => headingLevelMap[as as string]};

  @media (max-width: 768px) {
    font-size: ${({ as }) => headingLevelMobileMap[as as string]};
  }
`;

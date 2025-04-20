'use client';

import styled from 'styled-components';

import { HeadingStylingProps } from './Heading.types';

const headingLevelMap: Record<string, string> = {
  h1: '2.5rem',
  h2: '2rem',
  h3: '1.5rem',
};

export const StyledHeading = styled.h2<HeadingStylingProps>`
  font-weight: bold;
  margin: 0;
  font-family: var(--secondary-font);
  width: 100%;

  font-size: ${({ $level }) => headingLevelMap[$level!]};
`;

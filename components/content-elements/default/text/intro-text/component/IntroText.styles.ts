'use client';

import styled, { css } from 'styled-components';

type ContainerProps = {
  $textColor?: string;
  $align?: 'left' | 'center' | 'right';
};

const headingStyles = css`
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  font-family: var(--tertiary-font);
  width: 100%;
`;

export const IntroTextContainer = styled.div<ContainerProps>`
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  gap: 2rem;
  color: ${({ $textColor }) => $textColor};

  & > div {
    width: 100%;
  }

  a,
  span {
    font-size: 1rem;
  }
`;

const typeMap: Record<string, string> = {
  h1: '2.5rem',
  h2: '2rem',
  h3: '1.75rem',
};

export const Heading = styled.h1<{ as: 'h1' | 'h2' | 'h3' }>`
  font-size: ${({ as = 'h2' }) => typeMap[as]};
  ${headingStyles}
`;

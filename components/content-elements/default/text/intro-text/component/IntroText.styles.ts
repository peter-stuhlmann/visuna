'use client';

import styled from 'styled-components';

type ContainerProps = {
  $textColor?: string;
  $align?: 'left' | 'center' | 'right';
};

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

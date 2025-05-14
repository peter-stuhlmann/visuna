'use client';

import styled from 'styled-components';
import { IntroTextStyleProps } from './IntroText.types';

export const IntroTextContainer = styled.div<IntroTextStyleProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  gap: 2rem;
  color: ${({ $textColor }) => $textColor};
  text-align: ${({ $align }) => $align};
`;

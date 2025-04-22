'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

type ContainerProps = {};

const marginMap: Record<string, string> = {
  none: '0',
  small: '0.5rem 0',
  medium: '1rem',
  large: '2rem',
};

const sizeMap: Record<string, string> = {
  small: '0.25rem 0.5rem',
  medium: '0.5rem 1rem',
  large: '1rem 2rem',
};

export const ListContainer = styled.ul<ContainerProps>`
  margin: 0;
  padding: 0;
  border-radius: 1rem;
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  & > li {
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;

    .${mergedConfig.classPrefix + '-'}list-icon {
      width: 1rem;
      flex: 0 0 1rem;
      display: flex;
      justify-content: center;
      padding-top: 0.25rem;
    }
  }
`;

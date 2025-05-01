'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const ListContainer = styled.ul`
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

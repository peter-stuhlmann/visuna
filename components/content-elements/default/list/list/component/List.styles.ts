'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';
import { ListItemStyleProps, ListStyleProps } from './List.types';

export const ListContainer = styled.ul<ListStyleProps>`
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${({ $textColor }) => $textColor};
`;

export const ListItem = styled.li<ListItemStyleProps>`
  &.${mergedConfig.classPrefix + '-'}list-item {
    display: flex;
    justify-content: flex-start;
    overflow: hidden;

    & > div {
      display: flex;
      justify-content: flex-start;

      &.highlighted-text {
        span {
          background-color: ${({ $highlightColor }) => $highlightColor};
          padding: 0.25rem 0.5rem;
          display: inline;
        }
      }
    }
  }
`;

'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../default.config';
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
    .text {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 0.5rem;
      overflow: hidden;

      svg {
        flex-shrink: 0;
        padding-top: 4px;
      }
    }
  }
`;

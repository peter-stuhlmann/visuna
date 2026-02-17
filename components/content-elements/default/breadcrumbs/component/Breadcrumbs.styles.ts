'use client';

import styled from 'styled-components';
import { BreadcrumbsStyleProps } from './Breadcrumbs.types';

export const BreadcrumbsContainer = styled.nav<BreadcrumbsStyleProps>`
  display: flex;
  width: 100%;
  gap: 2rem;
  overflow: visible;

  & > a {
    color: ${({ $linkTextColor }) => $linkTextColor};
  }
  & > span {
    color: ${({ $textColor }) => $textColor};
  }

  & > a,
  & > span {
    text-decoration: none;
    position: relative;
    min-width: 0;

    &::before {
      content: '>';
      color: ${({ $dividerColor }) => $dividerColor};
      position: absolute;
      right: -1.25rem;
      pointer-events: none;
      font-family: var(--tertiary-font);
    }

    &:last-child::before {
      display: none;
    }

    &.highlighted {
      color: ${({ $highlightedTextColor }) => $highlightedTextColor};

      & > span {
        display: block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
`;

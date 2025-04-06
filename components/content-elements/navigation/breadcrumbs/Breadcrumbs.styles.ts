'use client';

import styled, { css } from 'styled-components';
import { PRIMARY_COLOR } from '../../content-elements.config';

type ContainerProps = {
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $padding?: 'none' | 'small' | 'medium' | 'large';
};

const marginMap: Record<string, string> = {
  none: '0',
  small: '0.5rem 0',
  medium: '1rem',
  large: '2rem',
};

export const Container = styled.nav<ContainerProps>`
  display: flex;
  width: 100%;
  gap: 2rem;
  font-size: 1rem;
  overflow: visible;
  margin: ${({ $margin = 'none' }) => marginMap[$margin]};

  @media (max-width: 480px) {
    font-size: 0.875rem;
  }

  & > a,
  & > span {
    color: ${({ theme }) =>
      theme.breadcrumb?.link?.color || PRIMARY_COLOR['950']};
    text-decoration: none;
    position: relative;
    min-width: 0;

    &::before {
      ${({ theme }) =>
        theme.breadcrumb?.link?.before ||
        css`
          content: '>';
          color: ${({ theme }) =>
            theme.breadcrumb?.divider?.color || PRIMARY_COLOR['400']};
          position: absolute;
          right: -1.25rem;
          pointer-events: none;
          font-family: var(--tertiary-font);
        `}
    }

    &:last-child::before {
      display: none;
    }

    &.is-active {
      color: ${({ theme }) =>
        theme.breadcrumb?.isActive?.color || PRIMARY_COLOR['500']};
    }

    // Der eigentliche Text, der bei Überlänge abgeschnitten wird
    & > span {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`;

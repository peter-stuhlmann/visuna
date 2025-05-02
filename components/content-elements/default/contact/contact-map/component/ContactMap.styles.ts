'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const IconLinks = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;

  a {
    & > div:first-of-type {
      padding: 0;

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
`;

export const ListItems = styled.div`
  display: flex;
  flex-direction: column;

  & > div {
    .${mergedConfig.classPrefix}-contact-map-list-item-label {
      font-weight: bold;
    }

    a {
      color: inherit;
      text-decoration: none;
    }
  }
`;

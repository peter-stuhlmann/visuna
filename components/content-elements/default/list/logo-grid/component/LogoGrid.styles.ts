'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const LogoGridContainer = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  & > li.${mergedConfig.classPrefix + '-'}logo-grid-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    box-sizing: border-box;
    flex: 0 0 calc(100% / 5);

    @media (max-width: 1280px) {
      flex: 0 0 calc(100% / 4);
    }

    @media (max-width: 768px) {
      flex: 0 0 calc(100% / 3);
      padding: 1rem 0.5rem;
    }

    @media (max-width: 480px) {
      flex: 0 0 calc(100% / 2);
    }

    img {
      object-fit: contain;
    }
  }
`;

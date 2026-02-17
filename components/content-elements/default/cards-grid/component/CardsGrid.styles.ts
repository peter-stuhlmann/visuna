'use client';

import styled from 'styled-components';
import { getPrimaryColor } from '../../constants';

export const CardsGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1rem;

  @container resizable-area (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
  }

  @container resizable-area (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  & > div,
  & > a,
  & > button {
    padding: 1rem;
    background-color: ${getPrimaryColor()['300']};
    border-radius: 1rem;
    text-decoration: none;
    color: inherit;
    position: relative;
    border: none;
    font-size: 1rem;
    line-height: 1.5;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
  }
`;

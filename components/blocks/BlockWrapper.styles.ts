'use client';

import styled from 'styled-components';

export const BlockWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem 0;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  & > div {
    display: flex;
    align-items: flex-start;
    width: 100%;

    &:first-of-type {
      flex-direction: column;
      padding-top: 1.2rem;
    }

    & > div {
      width: 100%;
    }
  }
`;

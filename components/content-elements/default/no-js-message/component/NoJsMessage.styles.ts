'use client';

import styled from 'styled-components';

export const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 1rem;

  & > div {
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      flex: 0 0 1rem;
      width: 1rem;
      height: 1rem;
    }
  }
`;

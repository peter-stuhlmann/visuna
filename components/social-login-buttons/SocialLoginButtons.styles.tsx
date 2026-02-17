'use client';

import styled from 'styled-components';

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin: 0.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.15);
  }

  span {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: lowercase;
  }
`;

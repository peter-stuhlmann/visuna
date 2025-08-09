'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalDashboardStyles = createGlobalStyle`
  .multi-input-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 1rem;
    margin: 0;
    padding: 0;
    width: 100%;
    list-style-type: none;
  }
  .multi-input-row {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  .multi-input-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex: 0 0 50px;
    border-radius: 1rem;
  }
`;

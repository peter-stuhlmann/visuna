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

  .todo {
    color: green;
    position: relative;
    background: rgba(0, 128, 0, 0.1);
    padding: 1rem;
    border-radius: 1rem;

    &::before{
      content: '';
      width: 1rem;
      height: 1rem;
      background-color: green;
      border-radius: 50%;
      position: absolute;
      left: -8px;
      top: 20px;
      color: green;

    }

    ul {
      color: #000;
    }
  }
`;

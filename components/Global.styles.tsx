'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: rgb(0, 0, 0, 1);
    --secondary-color: rgb(255, 255, 255, 1);
    --primary-text-color: var(--primary-color);
    --font-size: 16px;
    --line-height: 1.6;
  }

  body {
    margin: 0;
    font-family: var(--primary-font), sans-serif;
    font-size: var(--font-size);
    line-height: var(--line-height);
    color: var(--text-color);
    background-color: #f4fdff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;


    & > div {
      flex: 1;

      & > main {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: 500;
      margin: 0 0 1rem 0;
    }

    :focus-visible {
      outline: 2px solid red;
      outline-offset: 2px;
    }
  }
`;

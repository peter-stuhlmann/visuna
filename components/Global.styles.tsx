'use client';

import { createGlobalStyle } from 'styled-components';
import { getPrimaryColor } from './content-elements/default/constants';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: rgb(0, 0, 0, 1);
    --secondary-color: rgb(255, 255, 255, 1);
    --primary-text-color: var(--primary-color);
    --font-size: 18px;
    --line-height: 1.6;

    @media (max-width: 1440px) {
      --font-size: 16px;
    }
  }
  
  html {
    font-size: var(--font-size);
  }

  body {
    margin: 0;
    font-family: var(--primary-font), sans-serif;
    line-height: var(--line-height);
    color: var(--text-color);
    background-color: ${getPrimaryColor()['0']};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;


    & > div {
      flex: 1;

      & > main {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    }

    .sr-only {
      position: absolute !important;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* :focus-visible {
      outline: 3px solid red;
    } */
  }
`;

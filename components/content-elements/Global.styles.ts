'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalLightStyles = createGlobalStyle`
  :root {
    --primary-color: rgb(0, 0, 0, 1);
    --secondary-color: rgb(255, 255, 255, 1);
    --primary-text-color: var(--primary-color);
    --font-size: 16px;
    --line-height: 1.6;
  }
`;

export const GlobalDarkStyles = createGlobalStyle`
  :root {
    --primary-color: red;
    --secondary-color: green;
    --primary-text-color: var(--primary-color);
    --font-size: 16px;
    --line-height: 1.6;
  }
`;

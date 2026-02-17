'use client';

import styled, { createGlobalStyle } from 'styled-components';

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
    font-size: var(--font-size);
    overflow: hidden;
    height: 100%;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: var(--primary-font), sans-serif;
    line-height: var(--line-height);
    color: var(--text-color) !important;
    background-color: rgb(255, 255, 255);
    min-height: 100vh;
    height: 100vh;
    overflow: hidden;
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
        // min-height: 100vh;
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
  }

  html.no-scroll,
  body.no-scroll {
    overflow: hidden !important;
    height: 100%;
    touch-action: none; /* verhindert Scroll auf Touch-Geräten */
  }

  .flex-row {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 1rem;
  }



  ::view-transition-new(root),
  ::view-transition-old(root) {
    animation: none !important;
  }

  ::view-transition-group(root) {
    z-index: auto !important;
  }

  ::view-transition-image-pair(auth-content) {
    isolation: isolate;
    will-change: transform, opacity;
  }

  ::view-transition-new(auth-content) {
    z-index: 2;
  }

  ::view-transition-old(auth-content) {
    z-index: 1;
  }
`;

export const ErrorMessage = styled.div`
  color: red;
`;

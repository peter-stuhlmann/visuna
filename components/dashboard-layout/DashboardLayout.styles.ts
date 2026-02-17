'use client';

import styled from 'styled-components';

export const DashboardLayoutContainer = styled.div<{ $isFixed?: boolean }>`
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  main {
    grid-area: main;
    padding: 0;
    box-sizing: border-box;
    flex: 1;
  }

  footer {
    grid-area: footer;
  }
`;

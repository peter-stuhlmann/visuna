'use client';

import styled from 'styled-components';

export const DashboardLayoutContainer = styled.div<{ $isFixed?: boolean }>`
  width: 100%;
  height: 100%;
  overflow: hidden;

  main {
    grid-area: main;
    padding: 0;
    box-sizing: border-box;
    flex: 1;
  }

  footer {
    grid-area: footer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

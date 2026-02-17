'use client';

import styled from 'styled-components';

export const MetricsContainer = styled.div<{
  $totalItems: number;
}>`
  /* Grid statt Flex */
  display: grid;
  gap: 1rem;

  /* Desktop/Default: so viele Spalten wie Items (eine Zeile) */
  grid-template-columns: repeat(
    ${({ $totalItems }) => Math.min(Math.max($totalItems, 1), 5)},
    minmax(0, 1fr)
  );

  @container resizable-area (max-width: 1280px) {
    grid-template-columns: repeat(
      ${({ $totalItems }) => Math.min(Math.max($totalItems, 1), 4)},
      minmax(0, 1fr)
    );
  }

  @container resizable-area (max-width: 1024px) {
    grid-template-columns: repeat(
      ${({ $totalItems }) => Math.min(Math.max($totalItems, 1), 3)},
      minmax(0, 1fr)
    );
  }

  @container resizable-area (max-width: 660px) {
    grid-template-columns: repeat(
      ${({ $totalItems }) => Math.min(Math.max($totalItems, 1), 2)},
      minmax(0, 1fr)
    );
  }

  @container resizable-area (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  /* Karten-Styling */
  & > div {
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 1000px; /* belassen wie vorher */
    text-align: center;
    position: relative;
    background: transparent; /* ggf. anpassen */
  }
`;

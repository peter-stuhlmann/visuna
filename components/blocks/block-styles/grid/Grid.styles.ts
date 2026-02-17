'use client';

import styled, { css } from 'styled-components';

/** Lokale Typen, damit es keine Zirkularimporte gibt */
export type BP = 'base' | 'sm' | 'md' | 'lg';
export type ColumnsConfig = Partial<Record<BP, number>>;
export type FullRowsConfig = Partial<Record<BP, number[]>>;
export type SpanMap = Partial<Record<BP, Record<number, number>>>;

export const GridContainer = styled.div`
  & > .title {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
`;

export type GridItemsProps = {
  $cols?: ColumnsConfig;
  $full?: FullRowsConfig;
  $gap?: string;
  $span?: SpanMap;
};

type CSSFragment = ReturnType<typeof css>;

const colsRule = (n?: number): CSSFragment => css`
  grid-template-columns: repeat(${n ?? 1}, minmax(0, 1fr));
`;

/** Beliebige Items (1-basiert) volle Breite */
const fullWidthRules = (indices?: number[]): CSSFragment => {
  if (!indices || indices.length === 0) return css``;
  return indices.reduce<CSSFragment>(
    (acc, i) => css`
      ${acc}
      & > *:nth-child(${i}) {
        grid-column: 1 / -1;
      }
    `,
    css``
  );
};

/** Item-Index → Spalten-Span */
const spanRules = (map?: Record<number, number>): CSSFragment => {
  if (!map) return css``;
  return Object.entries(map).reduce<CSSFragment>((acc, [idx, span]) => {
    const s = Math.max(1, Math.floor(Number(span)));
    const i = Math.max(1, Math.floor(Number(idx)));
    return css`
      ${acc}
      & > *:nth-child(${i}) {
        grid-column: span ${s} / span ${s};
      }
    `;
  }, css``);
};

export const GridItems = styled.div<GridItemsProps>`
  display: grid;
  gap: ${({ $gap }) => $gap ?? '0.5rem'};

  /* base */
  ${(p) => colsRule(p.$cols?.base ?? 1)}
  ${(p) => spanRules(p.$span?.base)}
  ${(p) => fullWidthRules(p.$full?.base)}

  /* 480px */
  @container (min-width: 480px) {
    ${(p) => colsRule(p.$cols?.sm ?? 2)}
    ${(p) => spanRules(p.$span?.sm)}
    ${(p) => fullWidthRules(p.$full?.sm)}
  }

  /* 768px */
  @container (min-width: 768px) {
    ${(p) => colsRule(p.$cols?.md ?? 3)}
    ${(p) => spanRules(p.$span?.md)}
    ${(p) => fullWidthRules(p.$full?.md)}
  }

  /* 1024px */
  @container (min-width: 1024px) {
    ${(p) => colsRule(p.$cols?.lg ?? 4)}
    ${(p) => spanRules(p.$span?.lg)}
    ${(p) => fullWidthRules(p.$full?.lg)}
  }
`;

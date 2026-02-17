'use client';

import React, { FC, ReactNode } from 'react';
import { GridContainer, GridItems, type GridItemsProps } from './Grid.styles';

/** Breakpoints für Container-Queries */
export type BP = 'base' | 'sm' | 'md' | 'lg';

/** Anzahl Spalten je Breakpoint */
export type ColumnsConfig = Partial<Record<BP, number>>;

/** 1-basierte Indizes der Items, die full width gehen sollen */
export type FullRowsConfig = Partial<Record<BP, number[]>>;

/** Item-Index (1-basiert) → Spalten-Span (z. B. 2 = zwei Spalten belegen) */
export type SpanMap = Partial<Record<BP, Record<number, number>>>;

type BlockGridLegacyProps = {
  /** (Legacy) Anzahl Spalten je Breakpoint */
  cols?: ColumnsConfig;
  /** (Legacy) Indizes je Breakpoint, die volle Breite belegen */
  full?: FullRowsConfig;
  /** (Legacy) Grid-Gap */
  gap?: string;
  /** (Legacy) Item-Spans je Breakpoint */
  span?: SpanMap;
};

type BlockGridLayout = {
  /** Anzahl Spalten je Breakpoint (z. B. { base:1, sm:2, md:3, lg:4 }) */
  columns?: ColumnsConfig;
  /** Welche Karten (1-basiert) sollen je Breakpoint volle Breite einnehmen? */
  fullAt?: FullRowsConfig;
  /** Grid-Gap (z. B. '0.5rem') */
  gap?: string;
  /** Item-Index → Span je Breakpoint */
  span?: SpanMap;
};

export type BlockGridProps = BlockGridLegacyProps & {
  /** Titel oberhalb des Grids */
  title?: string;
  /** Inhalte */
  children: ReactNode;
  /**
   * NEU: Kompaktes Layout-Objekt (empfohlen)
   * Beispiel:
   * layout={{
   *   columns: { base: 1, sm: 2, md: 3, lg: 4 },
   *   fullAt: { base: [1], sm: [1], md: [1], lg: [1] },
   *   gap: '0.75rem',
   *   span: { lg: { 2: 2, 3: 2 } }
   * }}
   */
  layout?: BlockGridLayout;
};

const DEFAULT_COLS: ColumnsConfig = { base: 1, sm: 2, md: 3, lg: 4 };

const BlockGrid: FC<BlockGridProps> = ({
  title,
  children,
  layout,
  // Legacy (weiterhin unterstützt)
  cols,
  full,
  gap,
  span,
}) => {
  // Bevorzugt das neue layout-API, fallback auf legacy
  const effectiveCols = layout?.columns ?? cols ?? DEFAULT_COLS;
  const effectiveFull = layout?.fullAt ?? full;
  const effectiveGap = layout?.gap ?? gap;
  const effectiveSpan = layout?.span ?? span;

  const gridProps: GridItemsProps = {
    $cols: effectiveCols,
    $full: effectiveFull,
    $gap: effectiveGap,
    $span: effectiveSpan,
  };

  return (
    <GridContainer>
      {title && <div className="title">{title}</div>}
      <GridItems {...gridProps}>{children}</GridItems>
    </GridContainer>
  );
};

export default BlockGrid;

'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Editor } from '@tiptap/react';
import type { Range } from '@tiptap/core';

import type { SlashCommandItem } from './slash-items';
import {
  SlashPanel,
  SlashRow,
  SlashIcon,
  SlashText,
  SlashTitle,
  SlashDesc,
  SlashEmpty,
  TableGridWrap,
  TableGrid,
  TableGridRow,
  TableGridCell,
  TableGridHeader,
  TableGridHint,
  BackRow,
  BackButton,
} from './SlashMenu.styles';

export type SlashMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type Props = {
  editor: Editor;
  range: Range;
  query: string;
  items: SlashCommandItem[];
  onRequestClose?: () => void;
};

const MIN_GRID = 5;
const MAX_GRID = 20;

export const SlashMenu = forwardRef<SlashMenuHandle, Props>((props, ref) => {
  const { editor, range, query, items, onRequestClose } = props;

  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<null | 'table-grid'>(null);

  const [gridRows, setGridRows] = useState(MIN_GRID);
  const [gridCols, setGridCols] = useState(MIN_GRID);
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);

  const panelRootRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const visible = items.filter((it) => {
      // ✅ wegfiltern statt disabled anzeigen
      if (it.isDisabled?.({ editor })) return false;

      if (!q) return true;

      const hay = [it.title, it.description, ...(it.keywords ?? [])]
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });

    return visible;
  }, [items, query, editor]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, panel]);

  useEffect(() => {
    panelRootRef.current?.focus();
  }, []);

  const close = () => onRequestClose?.();

  const runItem = (it: SlashCommandItem) => {
    if (it.opensPanel === 'table-grid') {
      setPanel('table-grid');
      setGridRows(MIN_GRID);
      setGridCols(MIN_GRID);
      setActiveRow(0);
      setActiveCol(0);
      return;
    }

    it.command?.({ editor, range });
    close();
  };

  const insertTable = (rows: number, cols: number) => {
    if (rows < 1 || cols < 1) return;
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    close();
  };

  const updateDynamicGridSize = (r: number, c: number) => {
    setGridRows((prev) => {
      const needed = r + 1;
      if (needed >= prev - 1 && prev < MAX_GRID)
        return Math.min(MAX_GRID, needed + 1);
      if (needed < prev - 1 && prev > MIN_GRID)
        return Math.max(MIN_GRID, needed + 1);
      return prev;
    });

    setGridCols((prev) => {
      const needed = c + 1;
      if (needed >= prev - 1 && prev < MAX_GRID)
        return Math.min(MAX_GRID, needed + 1);
      if (needed < prev - 1 && prev > MIN_GRID)
        return Math.max(MIN_GRID, needed + 1);
      return prev;
    });
  };

  const handleGridHover = (r: number, c: number) => {
    setActiveRow(r);
    setActiveCol(c);
    updateDynamicGridSize(r, c);
  };

  const handleGridClick = () => {
    insertTable(activeRow + 1, activeCol + 1);
  };

  const onKeyDown = (event: KeyboardEvent): boolean => {
    if (panel === 'table-grid') {
      if (event.key === 'Escape') {
        event.preventDefault();
        setPanel(null);
        return true;
      }

      let nr = activeRow;
      let nc = activeCol;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        nr = Math.max(0, activeRow - 1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        nr = Math.min(MAX_GRID - 1, activeRow + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nc = Math.max(0, activeCol - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nc = Math.min(MAX_GRID - 1, activeCol + 1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        insertTable(activeRow + 1, activeCol + 1);
        return true;
      }

      if (nr !== activeRow || nc !== activeCol) {
        setActiveRow(nr);
        setActiveCol(nc);
        updateDynamicGridSize(nr, nc);
      }
      return true;
    }

    if (!filtered.length) {
      if (event.key === 'Escape') {
        close();
        return true;
      }
      return false;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return true;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      runItem(filtered[activeIndex]!);
      return true;
    }
    if (event.key === 'Escape') {
      close();
      return true;
    }

    return false;
  };

  useImperativeHandle(ref, () => ({ onKeyDown }));

  return (
    <SlashPanel
      ref={panelRootRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Slash Command"
    >
      {panel === 'table-grid' ? (
        <TableGridWrap>
          <BackRow>
            <BackButton
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Zurück"
              title="Zurück"
            >
              ←
            </BackButton>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Tabelle einfügen
            </div>
          </BackRow>

          <TableGridHeader>{`${activeRow + 1} × ${
            activeCol + 1
          }`}</TableGridHeader>

          <TableGrid>
            {Array.from({ length: gridRows }).map((_, r) => (
              <TableGridRow key={r}>
                {Array.from({ length: gridCols }).map((__, c) => {
                  const selected = r <= activeRow && c <= activeCol;
                  return (
                    <TableGridCell
                      key={c}
                      type="button"
                      $selected={selected}
                      onMouseEnter={() => handleGridHover(r, c)}
                      onClick={handleGridClick}
                    />
                  );
                })}
              </TableGridRow>
            ))}
          </TableGrid>

          <TableGridHint>
            Pfeiltasten zum Auswählen, Enter zum Einfügen, Esc zum Zurück
          </TableGridHint>
        </TableGridWrap>
      ) : (
        <>
          {filtered.length === 0 ? (
            <SlashEmpty>Keine Treffer</SlashEmpty>
          ) : (
            filtered.map((it, idx) => (
              <SlashRow
                key={`${it.title}-${idx}`}
                type="button"
                $active={idx === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  runItem(it);
                }}
              >
                <SlashIcon>{it.icon}</SlashIcon>
                <SlashText>
                  <SlashTitle>{it.title}</SlashTitle>
                  <SlashDesc>{it.description}</SlashDesc>
                </SlashText>
              </SlashRow>
            ))
          )}
        </>
      )}
    </SlashPanel>
  );
});

SlashMenu.displayName = 'SlashMenu';

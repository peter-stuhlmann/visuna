'use client';

import React from 'react';
import styled from 'styled-components';
import Icon from '@/components/content-elements/default/core/icons/icon'; // ggf. Pfad anpassen

/* ===================== Typen ===================== */

export type IconBlockProps = {
  /** Label neben dem Trigger-Button (optional) */
  label?: string;
  /** Liste der Icon-Namen (z. B. ["PiGearBold","TbBolt","MdHome"]) */
  icons: string[];
  /** Aktuell ausgewähltes Icon (Name) */
  value?: string | null;
  /** Callback bei Auswahl */
  onChange: (name: string | null) => void;
  /** Pixelgröße der Icons (gilt für Trigger & Grid) */
  size?: number; // default 28
  /** Suchfeld anzeigen */
  searchable?: boolean; // default true
  /** Optional: "Keins"-Button anzeigen */
  allowNone?: boolean; // default true
  /** Platzhalter für das Suchfeld */
  searchPlaceholder?: string;
  /** Aria-Label fürs Grid */
  gridAriaLabel?: string;
};

/* ===================== Styles ===================== */

const Wrapper = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const TriggerRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TriggerButton = styled.button<{
  $sizePx: number;
  $isOpen?: boolean;
  $hasValue?: boolean;
}>`
  display: inline-grid;
  place-items: center;
  width: ${({ $sizePx }) => Math.max($sizePx + 16, 44)}px;
  height: ${({ $sizePx }) => Math.max($sizePx + 16, 44)}px;
  padding: 0;
  border-radius: 10px;
  cursor: pointer;

  border: 1px solid ${({ $isOpen }) => ($isOpen ? '#6366f1' : '#e5e7eb')};
  background: ${({ $isOpen }) => ($isOpen ? '#eef2ff' : '#fff')};

  &:hover {
    background: ${({ $isOpen }) => ($isOpen ? '#e0e7ff' : '#f9fafb')};
  }

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

const Panel = styled.div`
  margin-top: 0.5rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.5rem;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  width: 100%;
  font: inherit;

  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

const NoneButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? '#6366f1' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#eef2ff' : '#fff')};
  color: #111827;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font: inherit;
  white-space: nowrap;

  &:hover {
    background: #f9fafb;
  }
  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  align-items: stretch;
`;

const ItemButton = styled.button<{ $selected?: boolean }>`
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;
  align-items: center;
  gap: 0.35rem;

  padding: 0.5rem;
  background: ${({ $selected }) => ($selected ? '#eef2ff' : '#ffffff')};
  border: 1px solid ${({ $selected }) => ($selected ? '#6366f1' : '#e5e7eb')};
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => ($selected ? '#e0e7ff' : '#f9fafb')};
  }
  &:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  span {
    display: block;
    font-size: 11px;
    line-height: 1.2;
    color: #6b7280;
    text-align: center;
    word-break: break-word;
  }
`;

const VisuallyHidden = styled.span`
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: -1px;
`;

const EmptyState = styled.div`
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: #6b7280;
`;

/* ===================== Keyboard-Navigation fürs Grid ===================== */

function useKeyboardGridNav(
  refs: React.RefObject<HTMLButtonElement>[],
  colsGuess = 6
) {
  return React.useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
      const key = e.key;
      let next = idx;

      if (key === 'ArrowRight') next = idx + 1;
      else if (key === 'ArrowLeft') next = idx - 1;
      else if (key === 'ArrowDown') next = idx + colsGuess;
      else if (key === 'ArrowUp') next = idx - colsGuess;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = refs.length - 1;
      else return;

      e.preventDefault();
      const clamped = Math.max(0, Math.min(next, refs.length - 1));
      refs[clamped]?.current?.focus();
    },
    [refs, colsGuess]
  );
}

/* ===================== Komponente ===================== */

export const IconBlock: React.FC<IconBlockProps> = ({
  icons,
  value,
  onChange,
  size = 28,
  searchable = true,
  allowNone = true,
  searchPlaceholder = 'Icons durchsuchen …',
  gridAriaLabel = 'Icon-Auswahl',
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const q = query.trim().toLowerCase();

  const filtered = React.useMemo<string[]>(() => {
    if (!q) return icons;
    return icons.filter((n) => n.toLowerCase().includes(q));
  }, [icons, q]);

  // Refs für Grid-Buttons
  const btnRefs = React.useRef<React.RefObject<HTMLButtonElement>[]>([]);
  if (btnRefs.current.length !== filtered.length) {
    btnRefs.current = Array.from({ length: filtered.length }, (_, i) => {
      return btnRefs.current[i] ?? React.createRef<HTMLButtonElement>();
    });
  }
  const onKeyGrid = useKeyboardGridNav(btnRefs.current, 6);

  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  const close = React.useCallback(() => setOpen(false), []);

  // Optional: beim Öffnen das Suchfeld fokussieren
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const handlePick = React.useCallback(
    (name: string | null) => {
      onChange(name);
      close();
      // Fokus zurück auf den Trigger, damit der Flow angenehm bleibt
      triggerRef.current?.focus();
    },
    [onChange, close]
  );

  const currentIconName = value ?? null;
  const panelId = React.useId();

  // ESC schließt nur das Panel (kein Modal-Verhalten, bleibt im Fluss)
  React.useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <Wrapper>
      <TriggerRow>
        <TriggerButton
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          $sizePx={size}
          $isOpen={open}
          $hasValue={!!currentIconName}
          title={currentIconName ?? 'Kein Icon'}
        >
          {currentIconName ? (
            <Icon name={currentIconName} size={size} aria-hidden />
          ) : (
            <span>
              Kein
              <br />
              Icon
            </span>
          )}
        </TriggerButton>
      </TriggerRow>

      {open && (
        <Panel id={panelId} role="region" aria-label="Iconauswahl">
          {(searchable || allowNone) && (
            <Toolbar>
              {searchable && (
                <SearchInput
                  ref={searchInputRef}
                  type="search"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Icons filtern"
                />
              )}
              {allowNone && (
                <NoneButton
                  type="button"
                  onClick={() => handlePick(null)}
                  $active={!value}
                  title="Kein Icon verwenden"
                >
                  Kein Icon
                </NoneButton>
              )}
            </Toolbar>
          )}

          {filtered.length === 0 ? (
            <EmptyState>Keine Icons gefunden.</EmptyState>
          ) : (
            <Grid role="grid" aria-label={gridAriaLabel}>
              {filtered.map((name, i) => {
                const selected = value === name;
                return (
                  <ItemButton
                    key={name}
                    type="button"
                    ref={btnRefs.current[i]}
                    $selected={selected}
                    aria-pressed={selected}
                    aria-label={name}
                    title={name}
                    onClick={() => handlePick(name)}
                    onKeyDown={(e) => onKeyGrid(i, e)}
                  >
                    <Icon name={name} size={size} aria-hidden />
                    <span>{name.replace(/^[A-Z][a-z0-9]+/, '') || name}</span>
                    <VisuallyHidden>{name}</VisuallyHidden>
                  </ItemButton>
                );
              })}
            </Grid>
          )}
        </Panel>
      )}
    </Wrapper>
  );
};

export default IconBlock;

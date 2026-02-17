// app/components/search/Search.tsx
'use client';

import contentElementsMetaData from '@/data/content-elements-metadata';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { TextInput } from '../content-elements/default';

export type DefaultSearchable = {
  name: string;
  description?: string;
  tags?: string[];
  premium?: boolean; // true = Premium-Element
};

export type SearchItem = {
  categoryIndex: number;
  categoryTitle: string;
  element: (typeof contentElementsMetaData)[number]['elements'][number];
};

type Props<T> = {
  items: T[];
  onFilteredChange: (
    filtered: T[],
    meta: { query: string; includePremium: boolean }
  ) => void;

  /**
   * Optional: Wenn deine Item-Struktur anders ist, kannst du die Extraktion überschreiben.
   * Standard: { name, description, tags, premium }
   */
  getName?: (item: T) => string;
  getDescription?: (item: T) => string | undefined;
  getTags?: (item: T) => string[] | undefined;
  isPremium?: (item: T) => boolean;

  placeholder?: string;
  label?: string;
  includePremiumLabel?: string;

  defaultIncludePremium?: boolean; // default: true
  throttleMs?: number; // default: 200

  className?: string;
};

function normalize(str: string): string {
  return (
    str
      .toLowerCase()
      .normalize('NFKD')
      // diacritics entfernen
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  );
}

function buildHaystack(name: string, description?: string, tags?: string[]) {
  const parts = [name, description ?? '', ...(tags ?? [])].filter(Boolean);
  return normalize(parts.join(' '));
}

function tokenizeQuery(q: string): string[] {
  const cleaned = normalize(q);
  if (!cleaned) return [];
  // mehrere Leerzeichen, Kommas etc. zu Tokens
  return cleaned.split(/[\s,;]+/g).filter(Boolean);
}

export function PageElementsSearch<T extends { [key: string]: any }>({
  items,
  onFilteredChange,

  getName,
  getDescription,
  getTags,
  isPremium,

  placeholder = 'Suchen… (Name, Beschreibung, Tags)',
  label = 'Suche',
  includePremiumLabel = 'inkl. Premium-Elementen',

  defaultIncludePremium = true,
  throttleMs = 200,

  className,
}: Props<T>) {
  const inputId = useId();
  const checkboxId = useId();
  const statusId = useId();

  const [query, setQuery] = useState('');
  const [includePremium, setIncludePremium] = useState(defaultIncludePremium);

  // Throttle: filter nur alle X ms ausführen
  const timerRef = useRef<number | null>(null);
  const latestRef = useRef<{ query: string; includePremium: boolean }>({
    query,
    includePremium,
  });

  useEffect(() => {
    latestRef.current = { query, includePremium };
  }, [query, includePremium]);

  const extractors = useMemo(() => {
    const _getName =
      getName ??
      ((it: any) => {
        const v = it?.name;
        return typeof v === 'string' ? v : '';
      });

    const _getDescription =
      getDescription ??
      ((it: any) => {
        const v = it?.description;
        return typeof v === 'string' ? v : undefined;
      });

    const _getTags =
      getTags ??
      ((it: any) => {
        const v = it?.tags;
        return Array.isArray(v)
          ? v.filter((x) => typeof x === 'string')
          : undefined;
      });

    const _isPremium =
      isPremium ??
      ((it: any) => {
        return Boolean(it?.premium);
      });

    return { _getName, _getDescription, _getTags, _isPremium };
  }, [getName, getDescription, getTags, isPremium]);

  const runFilter = () => {
    const { query: q, includePremium: inc } = latestRef.current;

    const tokens = tokenizeQuery(q);

    const filtered = items.filter((item) => {
      // Premium-Filter
      if (!inc && extractors._isPremium(item)) return false;

      // Ohne Query: nur Premium-Regel
      if (tokens.length === 0) return true;

      const haystack = buildHaystack(
        extractors._getName(item),
        extractors._getDescription(item),
        extractors._getTags(item)
      );

      // Alle Tokens müssen matchen (AND-Logik)
      return tokens.every((t) => haystack.includes(t));
    });

    onFilteredChange(filtered, { query: q, includePremium: inc });
  };

  const scheduleFilter = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(
      () => {
        runFilter();
      },
      Math.max(0, throttleMs)
    );
  };

  // Initial + bei items-Wechsel direkt neu filtern (ohne Throttle, damit UI stimmt)
  useEffect(() => {
    runFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    scheduleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, includePremium]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Wrap className={className}>
      <SearchRegion role="search" aria-label="Elemente durchsuchen">
        <Row>
          <Field>
            <TextInput
              id={inputId}
              type="text"
              label={label}
              value={query}
              onChange={(value) => setQuery(value)}
              autoComplete="off"
            />
          </Field>

          <CheckboxField>
            <Checkbox
              id={checkboxId}
              type="checkbox"
              checked={includePremium}
              onChange={(e) => setIncludePremium(e.target.checked)}
            />
            <CheckboxLabel htmlFor={checkboxId}>
              {includePremiumLabel}
            </CheckboxLabel>
          </CheckboxField>
        </Row>

        {/* Screenreader-Status (z.B. "Filter aktiv") */}
        <SrOnly id={statusId} aria-live="polite">
          Filter aktiv. Suchtext: {query || 'leer'}. Premium:{' '}
          {includePremium ? 'inklusive' : 'exklusive'}.
        </SrOnly>
      </SearchRegion>
    </Wrap>
  );
}

/* ------------------ styled-components ------------------ */

const Wrap = styled.div`
  width: 100%;
`;

const SearchRegion = styled.div`
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;

  /* responsive: stapeln */
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Field = styled.div`
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 640px) {
    min-width: 0;
  }
`;

const Label = styled.label`
  font-size: 14px;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.75);
`;

const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: #fff;
  color: #000;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.45);
  }
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;

  @media (max-width: 640px) {
    align-items: flex-start;
    padding: 2px 2px;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #0a4a7b;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  user-select: none;
`;

const SrOnly = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

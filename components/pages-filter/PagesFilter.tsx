'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { MdOutlineVisibilityOff, MdOutlineVisibility } from 'react-icons/md';
import { TbSettingsCode, TbCalendar } from 'react-icons/tb';
import DateRangePicker from '@/components/content-elements/default/core/inputs/date-range-picker/DateRangePicker';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

export type PagesListFilterState = {
  status: PageVisibility[];
  name: string;
  slug: string;
  author: string;
  dateFrom: string;
  dateTo: string;
  workspaceCreatedAt: string;
};

type Props = {
  value: PagesListFilterState;
  onChange: (next: PagesListFilterState) => void;
  throttleMs?: number;
  workspaceCreatedAt?: string | Date; // New prop
};

export default function PagesListFilters({
  value,
  onChange,
  throttleMs = 350,
  workspaceCreatedAt,
}: Props) {
  const [nameDraft, setNameDraft] = useState(value.name);
  const [slugDraft, setSlugDraft] = useState(value.slug);

  const [authorDraft, setAuthorDraft] = useState(value.author);


  // Sync from outside (reset etc)
  useEffect(() => setNameDraft(value.name), [value.name]);
  useEffect(() => setSlugDraft(value.slug), [value.slug]);
  useEffect(() => setAuthorDraft(value.author), [value.author]);

  // Throttled updates
  useEffect(() => {
    const id = setTimeout(() => {
      if (nameDraft !== value.name) onChange({ ...value, name: nameDraft });
    }, throttleMs);
    return () => clearTimeout(id);
  }, [nameDraft, throttleMs]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (slugDraft !== value.slug) onChange({ ...value, slug: slugDraft });
    }, throttleMs);
    return () => clearTimeout(id);
  }, [slugDraft, throttleMs]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (authorDraft !== value.author)
        onChange({ ...value, author: authorDraft });
    }, throttleMs);
    return () => clearTimeout(id);
  }, [authorDraft, throttleMs]);

  const toggleStatus = (s: PageVisibility) => {
    const next = value.status.includes(s)
      ? value.status.filter((x) => x !== s)
      : [...value.status, s];

    onChange({ ...value, status: next });
  };

  const isActive = (s: PageVisibility) => value.status.includes(s);

  return (
    <Wrapper>
      <Grid>
        {/* ---------- COLUMN 1 ---------- */}
        <Col>
          <Field>
            <Label>Name</Label>
            <Input
              placeholder="z.B. Startseite…"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Slug</Label>
            <Input
              placeholder="z.B. impressum…"
              value={slugDraft}
              onChange={(e) => setSlugDraft(e.target.value)}
            />
          </Field>

          {/* <Field>
            <Label>Autor</Label>
            <Input
              placeholder="z.B. Max Mustermann…"
              value={authorDraft}
              onChange={(e) => setAuthorDraft(e.target.value)}
            />
          </Field> */}
        </Col>

        {/* ---------- COLUMN 2 ---------- */}
        <Col>
          <Label>Sichtbarkeit</Label>
          <StatusRow>
            <StatusButton
              type="button"
              $active={isActive('offline')}
              onClick={() => toggleStatus('offline')}
            >
              <MdOutlineVisibilityOff size={18} />
              Offline
            </StatusButton>

            <StatusButton
              type="button"
              $active={isActive('maintenance')}
              onClick={() => toggleStatus('maintenance')}
            >
              <TbSettingsCode size={18} />
              Wartung
            </StatusButton>

            <StatusButton
              type="button"
              $active={isActive('live')}
              onClick={() => toggleStatus('live')}
            >
              <MdOutlineVisibility size={18} />
              Live
            </StatusButton>
          </StatusRow>
        </Col>

        {/* ---------- COLUMN 3 ---------- */}
        <Col>
          <Label>Zeitraum</Label>
          <div style={{ position: 'relative' }}>
            <DateRangePicker
              value={{
                start: value.dateFrom ? new Date(value.dateFrom) : null,
                end: value.dateTo ? new Date(value.dateTo) : null,
              }}
              onChange={(range) => {
                const formatDateLocal = (d: Date) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const f = range.start ? formatDateLocal(range.start) : '';
                const t = range.end ? formatDateLocal(range.end) : '';
                onChange({ ...value, dateFrom: f, dateTo: t });
              }}
              workspaceCreatedAt={workspaceCreatedAt || value.workspaceCreatedAt}
            />
          </div>
        </Col>
      </Grid>

      <ResetRow>
        <ResetButton
          type="button"
          onClick={() =>
            onChange({
              ...value,
              status: [],
              name: '',
              slug: '',
              author: '',
              dateFrom: '',
              dateTo: '',
            })
          }
        >
          Reset
        </ResetButton>
      </ResetRow>
    </Wrapper>
  );
}

/* ---------------- STYLES ---------------- */

const Wrapper = styled.div`
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr 1.4fr;
  gap: 20px;
  background-color: aliceblue;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  opacity: 0.7;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  outline: none;
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: ${(p) => (p.$active ? '#111827' : 'transparent')};
  color: ${(p) => (p.$active ? 'white' : '#111827')};
  cursor: pointer;

  &:hover {
    background: ${(p) => (p.$active ? '#111827' : 'rgba(0,0,0,0.05)')};
  }
`;

const ResetRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;

const ResetButton = styled.button`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;



'use client';

import React from 'react';
import styled from 'styled-components';

export type DateRangeValue = {
  from: string;
  to: string;
};

type Props = {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;

  /** 🔑 Startdatum für "Gesamte Laufzeit" (z. B. workspace.createdAt) */
  workspaceCreatedAt: string | Date;
};

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31);
}

function safeDate(input: string | Date): Date {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isFinite(d.getTime()) ? d : new Date();
}

export default function DateRange({
  value,
  onChange,
  workspaceCreatedAt,
}: Props) {
  const now = new Date();
  const workspaceStart = safeDate(workspaceCreatedAt);

  const presets = [
    {
      label: 'Letzte 7 Tage',
      range: () => {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        return { from, to: now };
      },
    },
    {
      label: 'Diesen Monat',
      range: () => ({
        from: startOfMonth(now),
        to: endOfMonth(now),
      }),
    },
    {
      label: 'Letzten Monat',
      range: () => {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          from: startOfMonth(d),
          to: endOfMonth(d),
        };
      },
    },
    {
      label: 'Letzte 90 Tage',
      range: () => {
        const from = new Date();
        from.setDate(from.getDate() - 90);
        return { from, to: now };
      },
    },
    {
      label: 'Dieses Jahr',
      range: () => ({
        from: startOfYear(now),
        to: endOfYear(now),
      }),
    },
    {
      label: 'Letztes Jahr',
      range: () => {
        const y = now.getFullYear() - 1;
        return {
          from: new Date(y, 0, 1),
          to: new Date(y, 11, 31),
        };
      },
    },
    {
      label: 'Gesamte Laufzeit',
      range: () => ({
        from: workspaceStart,
        to: now,
      }),
    },
  ];

  const applyPreset = (fn: () => { from: Date; to: Date }) => {
    const { from, to } = fn();
    onChange({
      from: toInputDate(from),
      to: toInputDate(to),
    });
  };

  return (
    <Wrapper>
      <Inputs>
        <Field>
          <Label>Von</Label>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </Field>

        <Field>
          <Label>Bis</Label>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </Field>
      </Inputs>

      <Presets>
        {presets.map((p) => (
          <PresetButton key={p.label} onClick={() => applyPreset(p.range)}>
            {p.label}
          </PresetButton>
        ))}
      </Presets>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Inputs = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 370px) {
    width: 100%;
  }

  input {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
`;

const Label = styled.label`
  font-size: 12px;
  opacity: 0.7;
`;

const Presets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PresetButton = styled.button`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

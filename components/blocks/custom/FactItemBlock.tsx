// components/blocks/FactItemBlock.tsx
'use client';

import React, { FC, useMemo } from 'react';
import { BlockWrapper } from '../BlockWrapper.styles';
import { TextInput } from '@/components/content-elements/default';

export type FactItemValue = {
  id?: string;
  /** z. B. "Geburtsjahr", "Beruf", "Wohnort" */
  label: string;
  /** z. B. "1994", "Webentwickler", "Berlin" */
  value: string;
};

type FactItemBlockProps = {
  /** Überschrift im Editor, z. B. "Steckbrief-Fakt" */
  label: string;
  /** Aktueller Wert */
  value: FactItemValue | null | undefined;
  /** Callback bei Änderungen */
  onChange: (next: FactItemValue) => void;

  /** Optional: Zeilen (für mehrzeilige Eingaben) */
  labelRows?: number;
  valueRows?: number;
};

const FactItemBlock: FC<FactItemBlockProps> = ({
  label,
  value,
  onChange,
  labelRows,
  valueRows,
}) => {
  // Kontrollierte Defaults
  const safe = useMemo<FactItemValue>(() => {
    const v = value ?? ({} as FactItemValue);
    return {
      id: v.id,
      label: v.label ?? '',
      value: v.value ?? '',
    };
  }, [value]);

  const patch = (partial: Partial<FactItemValue>) => {
    onChange({ ...safe, ...partial });
  };

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <TextInput
          label="Label"
          value={safe.label}
          onChange={(val) => patch({ label: val })}
          rows={labelRows}
        />

        <TextInput
          label="Wert"
          value={safe.value}
          onChange={(val) => patch({ value: val })}
          rows={valueRows}
        />
      </div>
    </BlockWrapper>
  );
};

export default FactItemBlock;

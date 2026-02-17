// components/blocks/custom/CounterItemBlock.tsx
'use client';

import React, { FC, useEffect, useMemo, useRef } from 'react';
import { BlockWrapper } from '../BlockWrapper.styles';
import { TextInput } from '@/components/content-elements/default';
import NumberInput from '@/components/content-elements/default/inputs/number-input';
import SwitchInput from '@/components/content-elements/default/inputs/switch-input';
import SelectInput from '@/components/blocks/SelectInputBlock';
import { v4 as uuidv4 } from 'uuid';

export type CounterItemValue = {
  id: string;
  label: string;
  animated: boolean;
  startValue?: number | null;
  endValue?: number | null;
  /** jetzt frei wählbar */
  animationDuration?: string;
  prefixText?: string;
  suffixText?: string;
};

type CounterItemBlockProps = {
  label: string;
  value: CounterItemValue | null | undefined;
  onChange: (next: CounterItemValue) => void;

  /** Von außen steuerbare Animations-Optionen (frei definierbar) */
  durationOptions?: { label: string; value: string }[];
};

function toNumberOrNull(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const CounterItemBlock: FC<CounterItemBlockProps> = ({
  label,
  value,
  onChange,
  durationOptions,
}) => {
  // Fallback-Optionen (falls nichts übergeben wurde)
  const fallbackDurationOptions: { label: string; value: string }[] = [
    { label: 'Schnell (0,6s)', value: 'fast' },
    { label: 'Normal (1,2s)', value: 'normal' },
    { label: 'Langsam (2s)', value: 'slow' },
  ];
  const durOpts =
    Array.isArray(durationOptions) && durationOptions.length > 0
      ? durationOptions
      : fallbackDurationOptions;

  // Stabile ID erzeugen, falls nicht vorhanden
  const idRef = useRef<string | undefined>(value?.id);
  useEffect(() => {
    if (!idRef.current) {
      idRef.current = uuidv4();
      onChange({
        id: idRef.current,
        label: value?.label ?? '',
        animated: value?.animated ?? true,
        startValue: toNumberOrNull(value?.startValue) ?? 0,
        endValue: toNumberOrNull(value?.endValue) ?? 100,
        animationDuration:
          value?.animationDuration ?? durOpts[1]?.value ?? 'normal',
        prefixText: value?.prefixText ?? '',
        suffixText: value?.suffixText ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kontrollierte Defaults
  const safe = useMemo<CounterItemValue>(() => {
    const v = value ?? ({} as CounterItemValue);
    return {
      id: (v.id ?? idRef.current ?? uuidv4()) as string,
      label: v.label ?? '',
      animated: !!v.animated,
      startValue: toNumberOrNull(v.startValue),
      endValue: toNumberOrNull(v.endValue),
      animationDuration: v.animationDuration ?? durOpts[1]?.value ?? 'normal',
      prefixText: v.prefixText ?? '',
      suffixText: v.suffixText ?? '',
    };
  }, [value, durOpts]);

  const patch = (partial: Partial<CounterItemValue>) => {
    onChange({ ...safe, ...partial, id: safe.id });
  };

  // SelectInput braucht garantiert einen string
  const durationValue: string =
    safe.animationDuration ?? durOpts[1]?.value ?? 'normal';

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <TextInput
          label="Label"
          value={safe.label}
          onChange={(val) => patch({ label: val })}
        />

        <div>
          <SwitchInput
            label="Animiert"
            checked={!!safe.animated}
            onChange={(checked) => patch({ animated: checked })}
          />
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <NumberInput
            label="Startwert"
            value={safe.startValue ?? null}
            onChange={(n) => patch({ startValue: toNumberOrNull(n) })}
            min={Number.MIN_SAFE_INTEGER}
          />
          <NumberInput
            label="Endwert"
            value={safe.endValue ?? null}
            onChange={(n) => patch({ endValue: toNumberOrNull(n) })}
            min={Number.MIN_SAFE_INTEGER}
          />
        </div>

        <SelectInput
          label="Animationsdauer"
          value={durationValue}
          onChange={(val: string) =>
            patch({ animationDuration: val || durOpts[1]?.value || 'normal' })
          }
          options={durOpts}
        />

        <TextInput
          label="Prefix-Text"
          value={safe.prefixText}
          onChange={(val) => patch({ prefixText: val })}
        />
        <TextInput
          label="Suffix-Text"
          value={safe.suffixText}
          onChange={(val) => patch({ suffixText: val })}
        />
      </div>
    </BlockWrapper>
  );
};

export default CounterItemBlock;

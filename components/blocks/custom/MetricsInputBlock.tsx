import React, { FC, useMemo } from 'react';
import SelectInput from '../../content-elements/default/inputs/select-input';
import { SelectInputOption } from '../../content-elements/default/inputs/select-input/component/SelectInput.types';
import { BlockWrapper } from '../BlockWrapper.styles';
import { AnimationDuration } from '../../content-elements/default/types';
import { MetricsItemProps } from '../../content-elements/default/metrics/component/Metrics.types';

export type MetricsValue = {
  items: MetricsItemProps[];
};

type MetricsInputBlockProps = {
  value: MetricsValue | MetricsItemProps[]; // robust gegen alte Arrays
  onChange: (value: MetricsValue) => void;
  label?: string;
};

// --- Normalisierung ---
const isMetricsValue = (v: unknown): v is MetricsValue =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!v && typeof v === 'object' && Array.isArray((v as any).items);

const coerceToMetricsValue = (
  v: MetricsValue | MetricsItemProps[] | unknown
): MetricsValue => {
  if (Array.isArray(v)) return { items: v };
  if (isMetricsValue(v)) return v;
  return { items: [] };
};

const MetricsInputBlock: FC<MetricsInputBlockProps> = ({
  value,
  onChange,
  label,
}) => {
  const { items } = coerceToMetricsValue(value);

  const animationOptions: SelectInputOption[] = useMemo(
    () => [
      { label: 'Kurz', value: 'fast' },
      { label: 'Normal', value: 'normal' },
      { label: 'Lang', value: 'slow' },
    ],
    []
  );

  const genId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (crypto as any).randomUUID()
      : `m_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`;

  const updateItems = (next: MetricsItemProps[]) => onChange({ items: next });

  const addItem = () => {
    const next: MetricsItemProps = {
      id: genId(),
      label: '',
      animated: false,
      prefix: false,
      suffix: false,
    };
    updateItems([...(items ?? []), next]);
  };

  const removeItem = (id: string) => {
    updateItems((items ?? []).filter((it) => it.id !== id));
  };

  const updateItem = <K extends keyof MetricsItemProps>(
    id: string,
    key: K,
    val: MetricsItemProps[K]
  ) => {
    updateItems(
      (items ?? []).map((it) => {
        if (it.id !== id) return it;
        const next: MetricsItemProps = { ...it, [key]: val };

        // Konsistenzregeln
        if (key === 'animated' && (val as boolean) === false) {
          // EndZahl NICHT löschen – sie wird auch ohne Animation gebraucht
          delete next.startValue;
          delete next.animationDuration;
        }
        if (key === 'prefix' && (val as boolean) === false) {
          delete next.prefixText;
        }
        if (key === 'suffix' && (val as boolean) === false) {
          delete next.suffixText;
        }
        return next;
      })
    );
  };

  const updateNumber = (
    id: string,
    key: 'startValue' | 'endValue',
    raw: string
  ) => {
    const n = raw === '' ? undefined : Number(raw);
    updateItem(
      id,
      key,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Number.isFinite(n as number) ? (n as number) : undefined) as any
    );
  };

  return (
    <BlockWrapper>
      {label && <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>}

      <div style={{ display: 'grid', gap: 16 }}>
        {(items ?? []).map((it, idx) => (
          <fieldset
            key={it.id}
            style={{
              border: '1px solid #e3e3e3',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <legend style={{ padding: '0 8px', fontWeight: 600 }}>
              Item {idx + 1}
            </legend>

            {/* Label */}
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <label htmlFor={`label-${it.id}`} style={{ fontWeight: 500 }}>
                Label
              </label>
              <input
                id={`label-${it.id}`}
                type="text"
                value={it.label}
                onChange={(e) => updateItem(it.id, 'label', e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d0d0d0',
                }}
              />
            </div>

            {/* Animiert */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                id={`animated-${it.id}`}
                type="checkbox"
                checked={it.animated}
                onChange={(e) =>
                  updateItem(it.id, 'animated', e.target.checked)
                }
              />
              <label htmlFor={`animated-${it.id}`}>Animiert</label>
            </div>

            {/* EndZahl: immer sichtbar */}
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <label htmlFor={`end-${it.id}`} style={{ fontWeight: 500 }}>
                EndZahl
              </label>
              <input
                id={`end-${it.id}`}
                type="number"
                value={it.endValue ?? ''}
                onChange={(e) =>
                  updateNumber(it.id, 'endValue', e.target.value)
                }
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #d0d0d0',
                }}
              />
            </div>

            {/* StartZahl + Animationsdauer nur wenn animiert */}
            {it.animated && (
              <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label htmlFor={`start-${it.id}`} style={{ fontWeight: 500 }}>
                    StartZahl
                  </label>
                  <input
                    id={`start-${it.id}`}
                    type="number"
                    value={it.startValue ?? ''}
                    onChange={(e) =>
                      updateNumber(it.id, 'startValue', e.target.value)
                    }
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #d0d0d0',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label
                    htmlFor={`animspd-${it.id}`}
                    style={{ fontWeight: 500 }}
                  >
                    Animationsdauer
                  </label>
                  <SelectInput
                    label="Animationsdauer"
                    value={it.animationDuration ?? ''}
                    onChange={(e) =>
                      updateItem(
                        it.id,
                        'animationDuration',
                        (e.target.value as AnimationDuration) || undefined
                      )
                    }
                    options={animationOptions}
                  />
                </div>
              </div>
            )}

            {/* Prefix */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                id={`prefix-${it.id}`}
                type="checkbox"
                checked={!!it.prefix}
                onChange={(e) => updateItem(it.id, 'prefix', e.target.checked)}
              />
              <label htmlFor={`prefix-${it.id}`}>Prefix</label>
            </div>

            {it.prefix && (
              <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                <label
                  htmlFor={`prefix-text-${it.id}`}
                  style={{ fontWeight: 500 }}
                >
                  Prefix-Text
                </label>
                <input
                  id={`prefix-text-${it.id}`}
                  type="text"
                  value={it.prefixText ?? ''}
                  onChange={(e) =>
                    updateItem(it.id, 'prefixText', e.target.value)
                  }
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid #d0d0d0',
                  }}
                />
              </div>
            )}

            {/* Suffix */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                id={`suffix-${it.id}`}
                type="checkbox"
                checked={it.suffix}
                onChange={(e) => updateItem(it.id, 'suffix', e.target.checked)}
              />
              <label htmlFor={`suffix-${it.id}`}>Suffix</label>
            </div>

            {it.suffix && (
              <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                <label
                  htmlFor={`suffix-text-${it.id}`}
                  style={{ fontWeight: 500 }}
                >
                  Suffix-Text
                </label>
                <input
                  id={`suffix-text-${it.id}`}
                  type="text"
                  value={it.suffixText ?? ''}
                  onChange={(e) =>
                    updateItem(it.id, 'suffixText', e.target.value)
                  }
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid #d0d0d0',
                  }}
                />
              </div>
            )}

            {/* Entfernen */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
                aria-label={`Item ${idx + 1} entfernen`}
              >
                Entfernen
              </button>
            </div>
          </fieldset>
        ))}

        {/* Hinzufügen */}
        <button
          type="button"
          onClick={addItem}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #ddd',
            background: '#f5f5f5',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Item hinzufügen
        </button>
      </div>
    </BlockWrapper>
  );
};

export default MetricsInputBlock;

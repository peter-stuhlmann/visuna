'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import type { BaseFieldType, FieldOption } from './types';
import {
  clone,
  isPlainObject,
  deepFillMissingNonMutating,
  newId,
} from './objectUtils';
import { renderSingleField } from './registry';

type RepeatableFieldListProps = {
  fieldType: BaseFieldType;
  name: string;
  label?: string;
  values: any[] | undefined;
  onChange: (next: any[]) => void;

  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  rows?: number;

  /** Template für neue Items (aus settings.default[0]) */
  itemTemplate?: any;

  workspaceId?: string;
};

const primitiveEmpty = (t: BaseFieldType) => {
  switch (t) {
    case 'checkbox':
    case 'switch':
      return false;
    case 'number':
    case 'slider':
      return 0;
    case 'map':
      return { lat: 0, lng: 0, zoom: 5 };
    default:
      return '';
  }
};

const needsObjectType = new Set<BaseFieldType>([
  'accordion-item',
  'fact-item',
  'list-item',
  'tabmenu-item',
  'counter-item',
  'animated-card',
  'link',
]);

const RepeatableFieldList: React.FC<RepeatableFieldListProps> = ({
  fieldType,
  name,
  label,
  values,
  onChange,
  options,
  min,
  max,
  step,
  placeholder,
  rows,
  itemTemplate,
  workspaceId,
}) => {
  const rawList = Array.isArray(values) ? values : [];

  const normalizedList = useMemo(() => {
    if (needsObjectType.has(fieldType)) {
      const seed = isPlainObject(itemTemplate) ? itemTemplate : {};
      return rawList.map((item) => {
        if (!isPlainObject(item)) return clone(seed);
        return deepFillMissingNonMutating(item, seed);
      });
    }

    return rawList.map((item) =>
      item === undefined ? primitiveEmpty(fieldType) : item
    );
  }, [rawList, fieldType, itemTemplate]);

  // Nur zurückschreiben, wenn sich Referenzen geändert haben
  useEffect(() => {
    const upgraded =
      normalizedList.length !== rawList.length ||
      normalizedList.some((v, i) => v !== rawList[i]);
    if (upgraded) onChange(normalizedList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedList]);

  const list = normalizedList;

  // Stabile Keys
  const idsRef = useRef<string[]>(list.map(() => newId()));
  if (idsRef.current.length < list.length) {
    while (idsRef.current.length < list.length) idsRef.current.push(newId());
  } else if (idsRef.current.length > list.length) {
    idsRef.current.splice(list.length);
  }

  const handleItemChange = (idx: number, v: any) => {
    const next = [...list];
    next[idx] = v;
    onChange(next);
  };

  const handleAdd = () => {
    const seed =
      (needsObjectType.has(fieldType) && isPlainObject(itemTemplate)
        ? itemTemplate
        : undefined) ?? primitiveEmpty(fieldType);
    const next = [...list, clone(seed)];
    idsRef.current = [...idsRef.current, newId()];
    onChange(next);
  };

  const handleRemove = (idx: number) => {
    const next = list.slice(0, idx).concat(list.slice(idx + 1));
    const nextIds = idsRef.current
      .slice(0, idx)
      .concat(idsRef.current.slice(idx + 1));
    idsRef.current = nextIds.length > 0 ? nextIds : [];
    onChange(next);
  };

  return (
    <div>
      {label ? (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      ) : null}

      {list.map((itemVal, i) => {
        const key = String(idsRef.current[i] || `${name}-${i}`);
        return (
          <div
            key={key}
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              border: '1px dashed #e5e7eb',
              borderRadius: 8,
            }}
          >
            {renderSingleField(fieldType, {
              name: `${name}[${i}]`,
              label: `${label ?? name} #${i + 1}`,
              value: itemVal,
              onChange: (v: unknown) => handleItemChange(i, v),
              options,
              min,
              max,
              step,
              placeholder,
              rows,
              itemTemplate,
              workspaceId,
            })}

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Entfernen
              </button>
              {i === list.length - 1 && (
                <button
                  type="button"
                  onClick={handleAdd}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Weitere hinzufügen
                </button>
              )}
            </div>
          </div>
        );
      })}

      {list.length === 0 && (
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Hinzufügen
        </button>
      )}
    </div>
  );
};

export default RepeatableFieldList;

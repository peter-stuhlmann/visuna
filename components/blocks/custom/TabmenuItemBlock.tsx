// components/blocks/TabMenuItemBlock.tsx
'use client';

import React, { FC, useEffect, useMemo, useRef } from 'react';
import { BlockWrapper } from '../BlockWrapper.styles';
import { TextInput } from '@/components/content-elements/default';
import { v4 as uuidv4 } from 'uuid';

export type TabmenuItemValue = {
  id?: string;
  label: string;
  content: string;
};

type TabmenuItemBlockProps = {
  label: string;
  value: TabmenuItemValue | null | undefined;
  onChange: (next: TabmenuItemValue) => void;
};

const TabMenuItemBlock: FC<TabmenuItemBlockProps> = ({
  label,
  value,
  onChange,
}) => {
  // Merkt sich eine ID dauerhaft, ohne bei jedem Render neu zu generieren
  const idRef = useRef<string | undefined>(value?.id);

  // Falls noch keine ID vorhanden ist → genau einmal nachreichen
  useEffect(() => {
    if (!idRef.current) {
      idRef.current = uuidv4();
      onChange({
        id: idRef.current,
        label: value?.label ?? '',
        content: value?.content ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kontrollierte Defaults
  const safe = useMemo<TabmenuItemValue>(() => {
    const v = value ?? ({} as TabmenuItemValue);
    return {
      id: v.id ?? idRef.current, // immer die persistente ID
      label: v.label ?? '',
      content: v.content ?? '',
    };
  }, [value]);

  const patch = (partial: Partial<TabmenuItemValue>) => {
    onChange({ ...safe, ...partial, id: safe.id ?? idRef.current });
  };

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <TextInput
          label="Label"
          value={safe.label}
          onChange={(val) => patch({ label: val })}
        />

        <TextInput
          label="Text"
          value={safe.content}
          onChange={(val) => patch({ content: val })}
        />
      </div>
    </BlockWrapper>
  );
};

export default TabMenuItemBlock;

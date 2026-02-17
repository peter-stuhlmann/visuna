'use client';

import React, { FC, useMemo } from 'react';
import { IconProps, TextInput } from '@/components/content-elements/default';
import { BlockWrapper } from '@/components/blocks/BlockWrapper.styles';
import IconBlock from '@/components/blocks/IconBlock';

export type ListItemIconValue = {
  name?: IconProps['name'] | null;
};

export type ListItemValue = {
  id?: string;
  icon: ListItemIconValue;
  text: string;
};

type ListItemBlockProps = {
  label: string;
  value: ListItemValue | null | undefined;
  onChange: (next: ListItemValue) => void;
};

const ListItemBlock: FC<ListItemBlockProps> = ({ label, value, onChange }) => {
  const safe = useMemo<ListItemValue>(() => {
    const v = (value ?? {}) as Partial<ListItemValue> & {
      icon?: ListItemIconValue | string;
    };

    // Icon robust normalisieren: unterstützt altes Format (string) und neues (Objekt)
    const rawIcon = v.icon;
    let icon: ListItemIconValue;

    if (typeof rawIcon === 'string') {
      // Altes Format: icon: "PiGearBold"
      icon = { name: rawIcon as IconProps['name'] };
    } else if (rawIcon && typeof rawIcon === 'object') {
      // Neues Format: icon: { name: "PiGearBold" }
      icon = {
        name: (rawIcon.name as IconProps['name'] | null | undefined) ?? null,
      };
    } else {
      icon = { name: null };
    }

    return {
      id: v.id,
      icon,
      text: typeof v.text === 'string' ? v.text : '',
    };
  }, [value]);

  const patch = (partial: Partial<ListItemValue>) => {
    onChange({
      ...safe,
      ...partial,
      // Icon immer als Objekt mergen, falls im Partial etwas kommt
      icon: {
        ...safe.icon,
        ...(partial.icon ?? {}),
      },
    });
  };

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {/* Visuelle Icon-Auswahl – speichert als icon: { name: "..." } */}
        <IconBlock
          label="Icon auswählen"
          icons={['PiGearBold', 'TbBolt', 'MdHome']}
          value={safe.icon.name ?? null}
          onChange={(name) =>
            patch({
              icon: {
                ...safe.icon,
                name: name ?? null,
              },
            })
          }
        />

        <TextInput
          label="Text"
          value={safe.text}
          onChange={(val) => patch({ text: val })}
        />
      </div>
    </BlockWrapper>
  );
};

export default ListItemBlock;

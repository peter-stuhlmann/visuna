// components/blocks/AccordionItemBlock.tsx
'use client';

import React, { FC, useMemo } from 'react';
import { BlockWrapper } from '../BlockWrapper.styles';
import MultiLanguageEditor from '../editor/MultiLanguageEditor';
import type { LocalizedFieldValue } from '../editor/MultiLanguageEditor';

export type AccordionItemValue = {
  id?: string;

  // ✅ mehrsprachig + DB-shape (value + element)
  title: LocalizedFieldValue;
  content: LocalizedFieldValue;
};

type AccordionItemBlockProps = {
  /** Überschrift des Blocks im Editor, z. B. "Accordion-Item" */
  label: string;
  /** Aktueller Wert des Items */
  value: AccordionItemValue | null | undefined;
  /** Callback bei Änderungen */
  onChange: (next: AccordionItemValue) => void;
};

const AccordionItemBlock: FC<AccordionItemBlockProps> = ({
  label,
  value,
  onChange,
}) => {
  // ✅ kontrollierte Defaults
  const safe = useMemo<AccordionItemValue>(() => {
    const v = value ?? ({} as AccordionItemValue);
    return {
      id: v.id,
      title: v.title ?? { value: {}, element: 'div' },
      content: v.content ?? { value: {}, element: 'div' },
    };
  }, [value]);

  const patch = (partial: Partial<AccordionItemValue>) => {
    onChange({ ...safe, ...partial });
  };

  return (
    <BlockWrapper>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {/* ✅ Titel -> safe.title */}
        <MultiLanguageEditor
          label="Titel"
          singleLine
          value={safe.title}
          onChange={(next) => patch({ title: next })}
        />

        {/* ✅ Inhalt -> safe.content */}
        <MultiLanguageEditor
          label="Inhalt"
          value={safe.content}
          onChange={(next) => patch({ content: next })}
        />
      </div>
    </BlockWrapper>
  );
};

export default AccordionItemBlock;

'use client';

import { FC, useState } from 'react';
import { AccordionItem, AccordionProps } from './Accordion.types';
import { AccordionContainer } from './Accordion.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../constants';
import AccordionPanel from './AccordionPanel';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import { LocalizedHtml } from '@/components/blocks/editor/MultiLanguageEditor';

type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSingleLineElement(v: unknown): v is SingleLineElement {
  return (
    v === 'div' ||
    v === 'h1' ||
    v === 'h2' ||
    v === 'h3' ||
    v === 'h4' ||
    v === 'h5' ||
    v === 'h6'
  );
}

function isLocalizedHtml(v: unknown): v is LocalizedHtml {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

function isLocalizedFieldValue(v: unknown): v is LocalizedFieldValue {
  if (!isRecord(v)) return false;
  const value = (v as { value?: unknown }).value;
  const element = (v as { element?: unknown }).element;
  return isLocalizedHtml(value) && isSingleLineElement(element);
}

function resolveLocalizedTextOnlyNewFormat(
  value: unknown,
  lang: string
): string {
  if (!isLocalizedFieldValue(value)) return '';
  const map = value.value;

  const byLang = map[lang];
  if (byLang && byLang.trim()) return byLang.trim();

  const de = map.de;
  if (de && de.trim()) return de.trim();

  const first = Object.values(map).find((v) => v && v.trim());
  return first ? first.trim() : '';
}

const Accordion: FC<AccordionProps> = ({ data }) => {
  const {
    items = [],
    defaultIconColor = getPrimaryColor()['950'],
    allowMultiple = false,
    initialOpenIndex = null,
    textColor = getPrimaryColor()['950'],
    panelBackgroundColor = getPrimaryColor()['0'],
    currentLanguage,
  } = (data ?? {}) as AccordionProps['data'] & { currentLanguage?: string };

  const lang = currentLanguage || DEFAULT_LANGUAGES[0];
  const elementClassName = getElementClassName('accordion');

  const [openIndexes, setOpenIndexes] = useState<number[]>(() => {
    if (
      initialOpenIndex !== null &&
      typeof initialOpenIndex === 'number' &&
      initialOpenIndex >= 0 &&
      initialOpenIndex < items.length
    ) {
      return [initialOpenIndex];
    }
    return [];
  });

  const togglePanel = (idx: number) => {
    setOpenIndexes((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      return allowMultiple ? [...prev, idx] : [idx];
    });
  };

  return (
    <AccordionContainer
      $panelBackgroundColor={panelBackgroundColor}
      $textColor={textColor}
    >
      {items.map((item: AccordionItem, idx: number) => {
        // ✅ title/content sind jetzt HTML-Strings (resolved)
        const titleHtml = resolveLocalizedTextOnlyNewFormat(
          item.title as unknown,
          lang
        );
        const contentHtml = resolveLocalizedTextOnlyNewFormat(
          item.content as unknown,
          lang
        );

        return (
          <AccordionPanel
            key={idx}
            id={`accordion-${idx}`}
            index={idx}
            title={titleHtml}
            content={contentHtml}
            isOpen={openIndexes.includes(idx)}
            onToggle={() => togglePanel(idx)}
            iconColor={item.iconColor || defaultIconColor}
            classPrefix={elementClassName}
          />
        );
      })}
    </AccordionContainer>
  );
};

export default Accordion;

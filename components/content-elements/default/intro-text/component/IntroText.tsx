import { FC, useMemo } from 'react';
import { IntroTextContainer } from './IntroText.styles';
import { IntroTextProps } from './IntroText.types';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import type { LanguageCode } from '@/components/language-settings/languages';

/* =======================
   i18n helpers (NEW-only)
======================= */

type LocalizedHtml = Record<string, string>;
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

  if (!isLocalizedHtml(value)) return false;
  if (!isSingleLineElement(element)) return false;

  return true;
}

function pickLocalizedForView(map: LocalizedHtml, lang: LanguageCode): string {
  const byLang = map[lang];
  if (typeof byLang === 'string' && byLang.trim()) return byLang;

  const de = map.de;
  if (typeof de === 'string' && de.trim()) return de;

  const first = Object.values(map).find(
    (v) => typeof v === 'string' && v.trim()
  );
  return first ?? '';
}

function resolveLocalizedHtmlNewOnly(
  input: unknown,
  lang: LanguageCode
): string {
  if (!isLocalizedFieldValue(input)) return '';
  return pickLocalizedForView(input.value, lang);
}

/* =======================
   Component
======================= */

const IntroText: FC<IntroTextProps> = ({ data }) => {
  // data kommt vom Mapper mit currentLanguage
  const raw = (data ?? {}) as Record<string, unknown>;

  const lang: LanguageCode =
    (raw.currentLanguage as LanguageCode | undefined) ?? DEFAULT_LANGUAGES[0];

  const children = raw.children;

  const html = useMemo(
    () => resolveLocalizedHtmlNewOnly(children, lang),
    [children, lang]
  );

  return (
    <IntroTextContainer>
      {html ? (
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </IntroTextContainer>
  );
};

export default IntroText;

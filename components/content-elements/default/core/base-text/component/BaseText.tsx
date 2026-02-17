import { FC, useMemo } from 'react';

import { StyledBaseText } from './BaseText.styles';
import type { BaseTextProps } from './BaseText.types';
import { getPrimaryColor } from '../../../constants';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';

type LocalizedStringLike =
  | string
  | Record<string, unknown>
  | { value?: unknown; element?: unknown }
  | null
  | undefined;

/**
 * ✅ Gibt IMMER string zurück.
 * ✅ Verträgt:
 * - "text"
 * - { de: "text", en: "text" }
 * - { value: { de: "text" }, element: "h2" }  <-- NEU
 * - sowie kaputte Werte (numbers, objects, nulls)
 */
function resolveLocalizedText(
  value: LocalizedStringLike,
  lang: string
): string {
  if (value == null) return '';

  // Direktstring
  if (typeof value === 'string') return value;

  // Neu: { value, element } → wir nehmen nur .value
  if (typeof value === 'object' && value && 'value' in value) {
    const inner = (value as { value?: unknown }).value;
    return resolveLocalizedText(inner as LocalizedStringLike, lang);
  }

  // Objekt: { de, en, ... }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    const byLang = obj[lang];
    if (typeof byLang === 'string' && byLang.trim()) return byLang.trim();

    const de = obj.de;
    if (typeof de === 'string' && de.trim()) return de.trim();

    const first = Object.values(obj).find(
      (v) => typeof v === 'string' && v.trim()
    ) as string | undefined;

    return first ? first.trim() : '';
  }

  return '';
}

const BaseText: FC<BaseTextProps> = ({
  textTransform = 'none',
  align = 'left',
  textColor = getPrimaryColor()['950'],
  element = 'div',

  value,
  htmlValue,

  currentLanguage,
  data,
}) => {
  const lang = currentLanguage || data?.currentLanguage || DEFAULT_LANGUAGES[0];

  const resolvedValue = useMemo(
    () => resolveLocalizedText(value as unknown as LocalizedStringLike, lang),
    [value, lang]
  );

  const resolvedHtmlValue = useMemo(
    () =>
      resolveLocalizedText(htmlValue as unknown as LocalizedStringLike, lang),
    [htmlValue, lang]
  );

  const hasHtml = resolvedHtmlValue.trim().length > 0;

  if (hasHtml) {
    return (
      <StyledBaseText
        as={element}
        $textTransform={textTransform}
        $align={align}
        $color={textColor}
        dangerouslySetInnerHTML={{ __html: resolvedHtmlValue }}
      />
    );
  }

  return (
    <StyledBaseText
      as={element}
      $textTransform={textTransform}
      $align={align}
      $color={textColor}
    >
      {resolvedValue}
    </StyledBaseText>
  );
};

export default BaseText;

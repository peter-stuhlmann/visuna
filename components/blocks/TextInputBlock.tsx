// components/blocks/TextInputBlock.tsx
'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { TextInput } from '../content-elements/default';
import { BlockWrapper } from './BlockWrapper.styles';
import LanguageTabs, { TabItem } from '../workspace-language-tabs/LanguageTabs';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '../language-settings/languages';
import { useAiTranslateField } from '@/components/ai-translate/useAiTranslateField';

export type TranslatedValue = Record<string, string>;
export type LocalizedTextValue = TranslatedValue | string | null | undefined;

type TextInputBlockProps = {
  label: string;
  rows?: number;

  value: LocalizedTextValue | unknown;
  onChange: (value: TranslatedValue | string) => void;

  multiLanguage?: boolean;

  workspaceId?: string;

  // Wenn gesetzt, wird NICHT gefetcht.
  languagesOverride?: LanguageCode[];
  mainLanguageOverride?: LanguageCode;

  // ✅ AI Translate
  translateFieldKey?: string; // z.B. "metaTitle"
  enableAiTranslate?: boolean;
  disabled?: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const coerceToTranslatedValue = (
  v: LocalizedTextValue | unknown,
  fallbackLang: LanguageCode
): TranslatedValue => {
  if (v == null) return {};
  if (typeof v === 'string') return v.length ? { [fallbackLang]: v } : {};
  if (isRecord(v)) {
    const result: TranslatedValue = {};
    for (const [k, val] of Object.entries(v)) {
      if (typeof val === 'string') result[k] = val;
    }
    return result;
  }
  return {};
};

const getLocalizedText = (
  map: TranslatedValue,
  lang: LanguageCode,
  fallbackLang: LanguageCode
): string => map?.[lang] ?? map?.[fallbackLang] ?? '';

/**
 * NICHT trimmen beim Tippen.
 * Nur wenn leer (nach trim), entfernen wir den Key.
 */
const setLocalizedText = (
  map: TranslatedValue,
  lang: LanguageCode,
  text: string
): TranslatedValue => {
  const next: TranslatedValue = { ...(map ?? {}) };
  const isEmpty = text.trim().length === 0;
  if (isEmpty) delete next[lang];
  else next[lang] = text;
  return next;
};

const AiPreviewContainer = styled.div`
  margin-top: 8px;
  border-radius: 0.75rem;
  border: 1px dashed #d1d5db;
  background-color: #ffffff;
  padding: 8px;
`;

const AiPreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;

  strong {
    font-size: 0.85rem;
    color: #111827;
  }
`;

const AiPreviewHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AiPreviewToggleButton = styled.button<{ $expanded: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #374151;
  transform: rotate(${(p) => (p.$expanded ? '0deg' : '-90deg')});
  transition: transform 0.15s ease;

  &:hover {
    background-color: #ececec;
  }
`;

const AiPreviewContent = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 6px;
  padding: 8px;
  max-height: 220px;
  overflow: auto;
  font-size: 0.9rem;
  line-height: 1.45;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

const AiPreviewHint = styled.div`
  font-size: 11px;
  color: #777;
  margin-top: 6px;
`;

const AiPreviewActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const AiPreviewButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'ghost';
}>`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid
    ${(p) =>
      p.$variant === 'primary'
        ? '#0070f3'
        : p.$variant === 'secondary'
          ? '#555'
          : '#d1d5db'};
  background-color: ${(p) =>
    p.$variant === 'primary'
      ? '#0070f3'
      : p.$variant === 'secondary'
        ? '#555'
        : '#f5f5f5'};
  color: ${(p) =>
    p.$variant === 'primary' || p.$variant === 'secondary'
      ? '#ffffff'
      : '#111827'};

  &:hover {
    background-color: ${(p) =>
      p.$variant === 'primary'
        ? '#0059c1'
        : p.$variant === 'secondary'
          ? '#444'
          : '#ececec'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const TextInputBlock: FC<TextInputBlockProps> = ({
  label,
  value,
  onChange,
  rows,
  multiLanguage = true,
  workspaceId,
  languagesOverride,
  mainLanguageOverride,
  translateFieldKey = 'content',
  enableAiTranslate = true,
  disabled,
}) => {
  const pathname = usePathname();

  const inferredWorkspaceId = useMemo(() => {
    if (workspaceId && workspaceId.trim()) return workspaceId.trim();
    const match = pathname.match(/\/workspaces\/([^/]+)/);
    if (match && match[1]) return match[1];
    return undefined;
  }, [workspaceId, pathname]);

  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageCode[]>(DEFAULT_LANGUAGES);
  const [mainLang, setMainLang] = useState<LanguageCode>(DEFAULT_LANGUAGES[0]);
  const [activeLang, setActiveLang] = useState<LanguageCode>(
    DEFAULT_LANGUAGES[0]
  );

  // Languages laden (oder override)
  useEffect(() => {
    if (languagesOverride && languagesOverride.length > 0) {
      const unique = Array.from(new Set(languagesOverride));
      const finalLanguages = unique.length ? unique : DEFAULT_LANGUAGES;

      const resolvedMain =
        mainLanguageOverride && finalLanguages.includes(mainLanguageOverride)
          ? mainLanguageOverride
          : finalLanguages[0];

      setAvailableLanguages(finalLanguages);
      setMainLang(resolvedMain);
      setActiveLang((prev) =>
        finalLanguages.includes(prev) ? prev : resolvedMain
      );
      return;
    }

    if (!inferredWorkspaceId) {
      setAvailableLanguages(DEFAULT_LANGUAGES);
      setMainLang(DEFAULT_LANGUAGES[0]);
      setActiveLang((prev) =>
        DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
      );
      return;
    }

    let isCancelled = false;

    const loadLanguages = async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${inferredWorkspaceId}/languages`
        );

        if (!res.ok) {
          if (!isCancelled) {
            setAvailableLanguages(DEFAULT_LANGUAGES);
            setMainLang(DEFAULT_LANGUAGES[0]);
          }
          return;
        }

        const data = (await res.json()) as {
          languages?: string[];
          mainLanguage?: string;
        };

        const allCodes = ALL_LANGUAGES.map((l) => l.code);
        const filtered = (data.languages ?? []).filter(
          (code): code is LanguageCode =>
            allCodes.includes(code as LanguageCode)
        );

        const unique = Array.from(new Set(filtered));
        const finalLanguages = unique.length ? unique : DEFAULT_LANGUAGES;

        const ml = data.mainLanguage as LanguageCode | undefined;
        const resolvedMain =
          ml && finalLanguages.includes(ml) ? ml : finalLanguages[0];

        if (!isCancelled) {
          setAvailableLanguages(finalLanguages);
          setMainLang(resolvedMain);
          setActiveLang((prev) =>
            finalLanguages.includes(prev) ? prev : resolvedMain
          );
        }
      } catch {
        if (!isCancelled) {
          setAvailableLanguages(DEFAULT_LANGUAGES);
          setMainLang(DEFAULT_LANGUAGES[0]);
        }
      }
    };

    void loadLanguages();
    return () => {
      isCancelled = true;
    };
  }, [inferredWorkspaceId, languagesOverride, mainLanguageOverride]);

  const localized = useMemo(
    () => coerceToTranslatedValue(value, mainLang),
    [value, mainLang]
  );

  const currentValue = multiLanguage
    ? getLocalizedText(localized, activeLang, mainLang)
    : typeof value === 'string'
      ? value
      : '';

  const handleChange = (next: string) => {
    if (!multiLanguage) {
      onChange(next);
      return;
    }
    onChange(setLocalizedText(localized, activeLang, next));
  };

  // ✅ AI Hook (einmalige Logik)
  const ai = useAiTranslateField({
    translateFieldKey,
    availableLanguages,
    activeLang,
    getTextForLanguage: (lang) => getLocalizedText(localized, lang, mainLang),
    applyTranslation: (lang, text) => {
      const next = setLocalizedText(localized, lang, text);
      onChange(next);
    },
    applyTranslationsBulk: (translations) => {
      let next = { ...localized };
      for (const [lang, text] of Object.entries(translations)) {
        next = setLocalizedText(next, lang as LanguageCode, text);
      }
      onChange(next);
    },
  });

  const hasAnyContent = Object.values(localized).some(
    (v) => v && v.trim() !== ''
  );

  const tabs: TabItem[] = useMemo(
    () =>
      availableLanguages.map((lang) => {
        const own = localized[lang];
        const hasOwn = !!own && own.trim() !== '';
        const warning = hasAnyContent && !hasOwn;

        return {
          key: lang,
          label: lang.toUpperCase(),
          warning,
          hasPendingSuggestion: ai.hasPendingSuggestionFor(lang),
        };
      }),
    [availableLanguages, localized, hasAnyContent, ai]
  );

  return (
    <BlockWrapper>
      {multiLanguage ? (
        <>
          <LanguageTabs
            tabs={tabs}
            activeKey={activeLang}
            sourceLanguageCode={mainLang}
            targetLanguageCode={activeLang}
            onChange={(key) => setActiveLang(key as LanguageCode)}
            label="Sprachen"
            mainLanguageCode={mainLang}
            loading={ai.isTranslating}
            onTranslateClick={
              enableAiTranslate ? ai.handleAiTranslateClick : undefined
            }
          />

          <TextInput
            label={`${label} (${activeLang.toUpperCase()})`}
            value={currentValue}
            onChange={handleChange}
            rows={rows}
            disabled={disabled}
          />

          {/* ✅ Pending Preview */}
          {ai.pendingAi && ai.currentSuggestion && (
            <AiPreviewContainer>
              <AiPreviewHeader>
                <strong>AI-Vorschlag für {activeLang.toUpperCase()}</strong>
                <AiPreviewHeaderRight>
                  {ai.suggestionsCount > 1 && (
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {ai.suggestionsCount} offene Vorschläge
                    </span>
                  )}
                  <AiPreviewToggleButton
                    type="button"
                    $expanded={ai.previewExpanded}
                    onClick={() => ai.setPreviewExpanded((p) => !p)}
                    aria-label={
                      ai.previewExpanded
                        ? 'Vorschau einklappen'
                        : 'Vorschau ausklappen'
                    }
                  >
                    ▾
                  </AiPreviewToggleButton>
                </AiPreviewHeaderRight>
              </AiPreviewHeader>

              {ai.previewExpanded && (
                <>
                  <AiPreviewContent>{ai.currentSuggestion}</AiPreviewContent>

                  <AiPreviewHint>
                    „In dieses Feld übernehmen“ überschreibt nur die aktuell
                    aktive Sprache. „Noch mal übersetzen“ aktualisiert nur diese
                    Sprache.
                  </AiPreviewHint>

                  <AiPreviewActions>
                    <AiPreviewButton
                      type="button"
                      onClick={ai.handleRetryCurrentSuggestion}
                      $variant="ghost"
                      disabled={ai.isTranslating}
                    >
                      Noch mal übersetzen (nur {activeLang.toUpperCase()})
                    </AiPreviewButton>

                    <AiPreviewButton
                      type="button"
                      onClick={ai.handleDiscardCurrentSuggestion}
                      $variant="ghost"
                      disabled={ai.isTranslating}
                    >
                      Vorschlag für {activeLang.toUpperCase()} verwerfen
                    </AiPreviewButton>

                    <AiPreviewButton
                      type="button"
                      onClick={ai.handleApplyCurrentSuggestion}
                      $variant="primary"
                      disabled={ai.isTranslating}
                    >
                      In dieses Feld übernehmen
                    </AiPreviewButton>

                    {ai.suggestionsCount > 1 && (
                      <>
                        <AiPreviewButton
                          type="button"
                          onClick={ai.handleApplyAllSuggestions}
                          $variant="secondary"
                          disabled={ai.isTranslating}
                        >
                          Alle Vorschläge übernehmen
                        </AiPreviewButton>

                        <AiPreviewButton
                          type="button"
                          onClick={ai.handleDiscardAllSuggestions}
                          $variant="ghost"
                          disabled={ai.isTranslating}
                        >
                          Alle Übersetzungsvorschläge verwerfen
                        </AiPreviewButton>
                      </>
                    )}
                  </AiPreviewActions>
                </>
              )}
            </AiPreviewContainer>
          )}
        </>
      ) : (
        <TextInput
          label={label}
          value={currentValue}
          onChange={handleChange}
          rows={rows}
          disabled={disabled}
        />
      )}
    </BlockWrapper>
  );
};

export default TextInputBlock;

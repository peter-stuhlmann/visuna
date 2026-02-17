'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import Editor, { SingleLineElement } from './Editor';

import LanguageTabs, {
  TabItem,
} from '@/components/workspace-language-tabs/LanguageTabs';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '@/components/language-settings/languages';
import { TranslateTarget } from '@/components/ai-translate/AiTranslate';

// Map: lang -> HTML-String (im singleLine: Inline-HTML OHNE <p>)
export type LocalizedHtml = Record<string, string>;

// ✅ DB-Shape, den dein MultiLanguageEditor wirklich speichert
export type LocalizedFieldValue = {
  value: LocalizedHtml;
  element: SingleLineElement;
};

export type LocalizedRichTextValue =
  | LocalizedFieldValue
  | LocalizedHtml
  | string
  | null
  | undefined;

type MultiLanguageEditorProps = {
  label?: string;

  /**
   * ✅ kann sein:
   * - LocalizedFieldValue (neu)
   * - LocalizedHtml / string / null (alt)
   */
  value: unknown;

  /**
   * ✅ gibt IMMER LocalizedFieldValue zurück (neu)
   */
  onChange: (next: LocalizedFieldValue) => void;

  workspaceId?: string;
  translateFieldKey?: string;

  singleLine?: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Normalisiert eingehende Werte auf LocalizedHtml:
 * - undefined/null -> {}
 * - string -> { de: string }  (TODO: später mainLanguage statt 'de')
 * - object -> nur string-Werte übernehmen
 */
const coerceToLocalizedHtml = (v: unknown): LocalizedHtml => {
  if (v == null) return {};

  if (typeof v === 'string') {
    const trimmed = v.trim();
    return trimmed ? { de: trimmed } : {};
  }

  if (isRecord(v)) {
    const result: LocalizedHtml = {};
    for (const [lang, val] of Object.entries(v)) {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed) result[lang] = trimmed;
      }
    }
    return result;
  }

  return {};
};

const getLocalizedHtml = (map: LocalizedHtml, lang: LanguageCode): string => {
  if (!map) return '';
  return map[lang] ?? '';
};

const setLocalizedHtml = (
  map: LocalizedHtml,
  lang: LanguageCode,
  html: string
): LocalizedHtml => {
  const next: LocalizedHtml = { ...map };
  const trimmed = html.trim();

  if (trimmed) next[lang] = trimmed;
  else delete next[lang];

  return next;
};

type PendingAiTranslations = {
  source: LanguageCode;
  target: TranslateTarget;
  targetLanguages: LanguageCode[];
  translations: Record<string, string>; // lang -> html
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
  margin-bottom: 4px;
  gap: 8px;

  strong {
    font-size: 0.85rem;
    color: #111827;
  }
`;

const AiPreviewHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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

const AiPreviewActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
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

const AiPreviewContent = styled.div`
  border-radius: 6px;
  padding: 4px;
  max-height: 260px;
  overflow: auto;
  line-height: 1.5;
  font-size: 0.95rem;
  color: #111827;
`;

const AiPreviewHint = styled.div`
  font-size: 11px;
  color: #777;
  margin-top: 4px;
`;

/**
 * ✅ Coerce auf DB-Format:
 * akzeptiert:
 * - { value: ..., element: ... } (neu)
 * - alte Werte direkt (LocalizedHtml|string)
 */
const coerceToLocalizedFieldValue = (input: unknown): LocalizedFieldValue => {
  // neu: { value, element }
  if (isRecord(input) && ('value' in input || 'element' in input)) {
    const rawValue = (input as { value?: unknown }).value;
    const rawElement = (input as { element?: unknown }).element;

    const value = coerceToLocalizedHtml(rawValue);
    const element =
      rawElement === 'div' ||
      rawElement === 'h1' ||
      rawElement === 'h2' ||
      rawElement === 'h3' ||
      rawElement === 'h4' ||
      rawElement === 'h5' ||
      rawElement === 'h6'
        ? (rawElement as SingleLineElement)
        : 'div';

    return { value, element };
  }

  // alt: LocalizedHtml|string
  return { value: coerceToLocalizedHtml(input), element: 'div' };
};

const MultiLanguageEditor: FC<MultiLanguageEditorProps> = ({
  label,
  value,
  onChange,
  workspaceId,
  translateFieldKey = 'content',
  singleLine = false,
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

  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingAi, setPendingAi] = useState<PendingAiTranslations | null>(
    null
  );
  const [previewExpanded, setPreviewExpanded] = useState(true);

  // ✅ Field-State aus value (DB-shape)
  const field = useMemo(() => coerceToLocalizedFieldValue(value), [value]);

  // ✅ globaler Element-State (nicht pro Sprache)
  const [elementState, setElementState] = useState<SingleLineElement>(
    field.element
  );

  // ✅ wenn DB-Wert sich ändert, übernehmen
  useEffect(() => {
    setElementState(field.element);
  }, [field.element]);

  const handleElementChange = (el: SingleLineElement) => {
    setElementState(el);
    onChange({ value: field.value, element: el });
  };

  // ✅ Key für Editor-Remount:
  const [editorMountKey, setEditorMountKey] = useState(0);
  const lastEmittedHtmlRef = useRef<string>('');

  // Sprachen aus dem Workspace laden
  useEffect(() => {
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
            setActiveLang((prev) =>
              DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
            );
          }
          return;
        }

        const data = (await res.json()) as {
          workspaceId: string;
          contentLanguages: string[];
          mainLanguage?: string;
        };

        const rawLanguages = Array.isArray(data.contentLanguages)
          ? data.contentLanguages
          : [];
        const allCodes = ALL_LANGUAGES.map((l) => l.code);

        const filtered = rawLanguages.filter((code): code is LanguageCode =>
          allCodes.includes(code as LanguageCode)
        );

        const unique = Array.from(new Set(filtered));
        const finalLanguages = unique.length > 0 ? unique : DEFAULT_LANGUAGES;

        if (!isCancelled) {
          setAvailableLanguages(finalLanguages);

          const mainLanguageFromData = data.mainLanguage as
            | LanguageCode
            | undefined;
          const resolvedMainLang =
            mainLanguageFromData &&
            finalLanguages.includes(mainLanguageFromData)
              ? mainLanguageFromData
              : finalLanguages[0];

          setMainLang(resolvedMainLang);
          setActiveLang((prev) =>
            finalLanguages.includes(prev) ? prev : resolvedMainLang
          );
        }
      } catch {
        if (!isCancelled) {
          setAvailableLanguages(DEFAULT_LANGUAGES);
          setMainLang(DEFAULT_LANGUAGES[0]);
          setActiveLang((prev) =>
            DEFAULT_LANGUAGES.includes(prev) ? prev : DEFAULT_LANGUAGES[0]
          );
        }
      }
    };

    void loadLanguages();

    return () => {
      isCancelled = true;
    };
  }, [inferredWorkspaceId]);

  const localized = field.value;
  const currentHtml = getLocalizedHtml(localized, activeLang);

  const handleEditorChange = (html: string) => {
    lastEmittedHtmlRef.current = html;
    const nextValue = setLocalizedHtml(localized, activeLang, html);
    onChange({ value: nextValue, element: elementState });
  };

  useEffect(() => {
    lastEmittedHtmlRef.current = currentHtml;
    setEditorMountKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  useEffect(() => {
    if (currentHtml === lastEmittedHtmlRef.current) return;
    lastEmittedHtmlRef.current = currentHtml;
    setEditorMountKey((k) => k + 1);
  }, [currentHtml]);

  const hasAnyContent = Object.values(localized).some(
    (v) => v && v.trim() !== ''
  );

  const tabs: TabItem[] = availableLanguages.map((lang) => {
    const ownContent = localized[lang];
    const hasOwnContent = !!ownContent && ownContent.trim() !== '';
    const showWarning = hasAnyContent && !hasOwnContent;

    const hasPendingSuggestion =
      !!pendingAi?.translations && !!pendingAi.translations[lang];

    return {
      key: lang,
      label: lang.toUpperCase(),
      warning: showWarning,
      hasPendingSuggestion,
    };
  });

  const handleAiTranslateClick = async (
    source: LanguageCode,
    target: TranslateTarget
  ) => {
    if (isTranslating) return;

    const textToTranslate = getLocalizedHtml(localized, source);
    if (!textToTranslate.trim()) return;

    const targetLanguages: LanguageCode[] =
      target === 'all'
        ? availableLanguages.filter((lang) => lang !== source)
        : availableLanguages.includes(target) && target !== source
          ? [target]
          : [];

    if (!targetLanguages.length) return;

    setIsTranslating(true);
    setPendingAi(null);

    try {
      const res = await fetch('/api/ai/translate-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translateFieldKey,
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguages,
        }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as Record<string, Record<string, string>>;
      const translations = data[translateFieldKey] ?? {};
      if (!translations || typeof translations !== 'object') return;

      const result: Record<string, string> = {};
      for (const [lang, html] of Object.entries(translations)) {
        const lc = lang as LanguageCode;
        if (!targetLanguages.includes(lc)) continue;
        if (typeof html !== 'string' || !html.trim()) continue;
        result[lc] = html.trim();
      }

      if (!Object.keys(result).length) return;

      setPendingAi({ source, target, targetLanguages, translations: result });
      setPreviewExpanded(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const currentSuggestion = pendingAi?.translations?.[activeLang] ?? undefined;

  const handleApplyCurrentSuggestion = () => {
    if (!pendingAi || !currentSuggestion) return;

    const nextValue = setLocalizedHtml(
      localized,
      activeLang,
      currentSuggestion
    );

    const newTranslations = { ...pendingAi.translations };
    delete newTranslations[activeLang];

    const remainingLangs = Object.keys(newTranslations);
    setPendingAi(
      remainingLangs.length
        ? {
            ...pendingAi,
            targetLanguages: pendingAi.targetLanguages.filter(
              (l) => l !== activeLang
            ),
            translations: newTranslations,
          }
        : null
    );

    onChange({ value: nextValue, element: elementState });
  };

  const handleDiscardCurrentSuggestion = () => {
    if (!pendingAi || !currentSuggestion) return;

    const newTranslations = { ...pendingAi.translations };
    delete newTranslations[activeLang];

    const remainingLangs = Object.keys(newTranslations);
    setPendingAi(
      remainingLangs.length
        ? {
            ...pendingAi,
            targetLanguages: pendingAi.targetLanguages.filter(
              (l) => l !== activeLang
            ),
            translations: newTranslations,
          }
        : null
    );
  };

  const handleApplyAllSuggestions = () => {
    if (!pendingAi) return;

    let nextValue: LocalizedHtml = { ...localized };

    for (const [lang, html] of Object.entries(pendingAi.translations)) {
      const lc = lang as LanguageCode;
      nextValue = setLocalizedHtml(nextValue, lc, html);
    }

    onChange({ value: nextValue, element: elementState });
    setPendingAi(null);
  };

  const handleDiscardAllSuggestions = () => {
    if (!pendingAi) return;
    setPendingAi(null);
  };

  const handleRetryCurrentSuggestion = async () => {
    if (!pendingAi) return;
    if (isTranslating) return;

    const source = pendingAi.source;
    const textToTranslate = getLocalizedHtml(localized, source);
    if (!textToTranslate.trim()) return;

    const targetLanguage: LanguageCode = activeLang;
    setIsTranslating(true);

    try {
      const res = await fetch('/api/ai/translate-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translateFieldKey,
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguages: [targetLanguage],
        }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as Record<string, Record<string, string>>;
      const translations = data[translateFieldKey] ?? {};
      const newHtml = translations[targetLanguage];

      if (typeof newHtml !== 'string' || !newHtml.trim()) return;

      setPendingAi((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          targetLanguages: Array.from(
            new Set([...prev.targetLanguages, targetLanguage])
          ),
          translations: {
            ...prev.translations,
            [targetLanguage]: newHtml.trim(),
          },
        };
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const suggestionsCount = pendingAi
    ? Object.keys(pendingAi.translations).length
    : 0;

  return (
    <div>
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}

      <LanguageTabs
        tabs={tabs}
        activeKey={activeLang}
        sourceLanguageCode={mainLang}
        targetLanguageCode={activeLang}
        onChange={(key) => setActiveLang(key as LanguageCode)}
        label="Sprachen"
        onTranslateClick={handleAiTranslateClick}
        loading={isTranslating}
        mainLanguageCode={mainLang}
      />

      <Editor
        key={`${activeLang}-${editorMountKey}`}
        value={currentHtml}
        onChange={handleEditorChange}
        singleLine={singleLine}
        element={elementState}
        onElementChange={handleElementChange}
        languageCode={activeLang}
      />

      {pendingAi && currentSuggestion && (
        <AiPreviewContainer>
          <AiPreviewHeader>
            <strong>AI-Vorschlag für {activeLang.toUpperCase()}</strong>
            <AiPreviewHeaderRight>
              {suggestionsCount > 1 && (
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {suggestionsCount} offene Vorschläge
                </span>
              )}
              <AiPreviewToggleButton
                type="button"
                $expanded={previewExpanded}
                onClick={() => setPreviewExpanded((prev) => !prev)}
              >
                ▾
              </AiPreviewToggleButton>
            </AiPreviewHeaderRight>
          </AiPreviewHeader>

          {previewExpanded && (
            <>
              <AiPreviewContent
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: currentSuggestion }}
              />

              <AiPreviewHint>
                „In dieses Feld übernehmen“ überschreibt nur die aktuell
                ausgewählte Sprache.
              </AiPreviewHint>

              <AiPreviewActions>
                <AiPreviewButton
                  type="button"
                  onClick={handleRetryCurrentSuggestion}
                  $variant="ghost"
                  disabled={isTranslating}
                >
                  Noch mal übersetzen (nur {activeLang.toUpperCase()})
                </AiPreviewButton>

                <AiPreviewButton
                  type="button"
                  onClick={handleDiscardCurrentSuggestion}
                  $variant="ghost"
                  disabled={isTranslating}
                >
                  Vorschlag verwerfen
                </AiPreviewButton>

                <AiPreviewButton
                  type="button"
                  onClick={handleApplyCurrentSuggestion}
                  $variant="primary"
                  disabled={isTranslating}
                >
                  In dieses Feld übernehmen
                </AiPreviewButton>

                {suggestionsCount > 1 && (
                  <>
                    <AiPreviewButton
                      type="button"
                      onClick={handleApplyAllSuggestions}
                      $variant="secondary"
                      disabled={isTranslating}
                    >
                      Alle Vorschläge übernehmen
                    </AiPreviewButton>

                    <AiPreviewButton
                      type="button"
                      onClick={handleDiscardAllSuggestions}
                      $variant="ghost"
                      disabled={isTranslating}
                    >
                      Alle verwerfen
                    </AiPreviewButton>
                  </>
                )}
              </AiPreviewActions>
            </>
          )}
        </AiPreviewContainer>
      )}
    </div>
  );
};

export default MultiLanguageEditor;

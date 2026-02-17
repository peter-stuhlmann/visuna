'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { RichTextEditor } from '@/components/blocks/richt-text-editor/RichTextEditor';
import LanguageTabs, {
  TabItem,
} from '@/components/workspace-language-tabs/LanguageTabs';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '@/components/language-settings/languages';
import { TranslateTarget } from '@/components/ai-translate/AiTranslate';

// Map: lang -> HTML-String
export type LocalizedHtml = Record<string, string>;
export type LocalizedRichTextValue = LocalizedHtml | string | null | undefined;

type MultiLanguageRichTextEditorBlockProps = {
  label?: string;
  // robust gegen alte / falsche Daten
  value: LocalizedRichTextValue | unknown;
  onChange: (value: LocalizedHtml) => void;
  /**
   * Optional: Workspace-ID.
   * Wenn gesetzt, wird sie direkt für den API-Call verwendet.
   * Wenn nicht gesetzt, wird versucht, die ID aus der URL zu lesen (/workspaces/:id/...).
   */
  workspaceId?: string;
  /**
   * Flexibler Feld-Key für die AI-Route.
   * Wird im Response als Top-Level-Property benutzt: { [translateFieldKey]: { de: "...", en: "..." } }
   */
  translateFieldKey?: string;
  multiline?: boolean;
};

/**
 * Normalisiert eingehende Werte auf LocalizedHtml:
 * - undefined/null -> {}
 * - string -> { de: string }  (TODO: später mainLanguage statt 'de')
 * - object -> nur string-Werte übernehmen
 */
const coerceToLocalizedHtml = (
  v: LocalizedRichTextValue | unknown
): LocalizedHtml => {
  if (v == null) return {};

  if (typeof v === 'string') {
    const trimmed = v.trim();
    return trimmed ? { de: trimmed } : {};
  }

  if (typeof v === 'object') {
    const result: LocalizedHtml = {};
    Object.entries(v as Record<string, unknown>).forEach(([lang, val]) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed) {
          result[lang] = trimmed;
        }
      }
    });
    return result;
  }

  return {};
};

const getLocalizedHtml = (map: LocalizedHtml, lang: LanguageCode): string => {
  if (!map) return '';
  // TODO: später mainLanguage statt 'de' hier einziehen
  return map[lang] ?? '';
};

const setLocalizedHtml = (
  map: LocalizedHtml,
  lang: LanguageCode,
  html: string
): LocalizedHtml => {
  const next: LocalizedHtml = { ...map };
  const trimmed = html.trim();

  if (trimmed) {
    next[lang] = trimmed;
  } else {
    delete next[lang];
  }

  return next;
};

type PendingAiTranslations = {
  source: LanguageCode;
  target: TranslateTarget;
  targetLanguages: LanguageCode[];
  translations: Record<string, string>; // lang -> html
};

/**
 * Vorschau-Wrapper: gleiche Typografie wie im RTE
 * (basierend auf StyledEditorContent / .ProseMirror)
 */
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

/**
 * Content-Styles (analog zum RTE)
 */
const AiPreviewContent = styled.div`
  border-radius: 6px;
  padding: 4px;
  max-height: 260px;
  overflow: auto;
  line-height: 1.5;
  font-size: 0.95rem;
  color: #111827;

  p {
    margin: 0 0 0.5rem 0;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem 0;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem 0;
  }

  ul,
  ol {
    padding-left: 1.2rem;
    margin: 0 0 0.5rem 0;
  }

  li {
    margin: 0.1rem 0;
  }

  blockquote {
    border-left: 3px solid #e5e7eb;
    padding-left: 0.75rem;
    color: #4b5563;
    font-style: italic;
    margin: 0 0 0.5rem 0;
  }

  code {
    font-family:
      'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #f3f4f6;
    padding: 2px 4px;
    border-radius: 3px;
  }

  pre {
    font-family:
      'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #111827;
    color: #f9f9f9;
    padding: 8px 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0 0 0.75rem 0;
  }

  a {
    color: #2563eb;
    text-decoration: underline;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5rem 0;
  }

  table th,
  table td {
    border: 1px solid #d1d5db;
    padding: 4px 6px;
    font-size: 0.85rem;
  }
`;

const AiPreviewHint = styled.div`
  font-size: 11px;
  color: #777;
  margin-top: 4px;
`;

const MultiLanguageRichTextEditorBlock: FC<
  MultiLanguageRichTextEditorBlockProps
> = ({
  label,
  value,
  onChange,
  workspaceId,
  translateFieldKey = 'content',
  multiline = true,
}) => {
  const pathname = usePathname();

  // workspaceId aus URL extrahieren, falls kein Prop übergeben wurde
  const inferredWorkspaceId = useMemo(() => {
    if (workspaceId && workspaceId.trim()) return workspaceId.trim();

    const match = pathname.match(/\/workspaces\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }

    return undefined;
  }, [workspaceId, pathname]);

  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageCode[]>(DEFAULT_LANGUAGES);

  // Hauptsprache des Workspaces (oder Fallback)
  const [mainLang, setMainLang] = useState<LanguageCode>(DEFAULT_LANGUAGES[0]);

  // aktuell aktive Sprache im Editor
  const [activeLang, setActiveLang] = useState<LanguageCode>(
    DEFAULT_LANGUAGES[0]
  );

  const [isTranslating, setIsTranslating] = useState(false);

  // 🔥 AI-Vorschläge, noch nicht übernommen
  const [pendingAi, setPendingAi] = useState<PendingAiTranslations | null>(
    null
  );

  // Vorschau ein-/ausklappen (global für alle Sprachen)
  const [previewExpanded, setPreviewExpanded] = useState(true);

  // Sprachen aus dem Workspace laden (Content-Sprachen)
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
          console.error(
            'get-content-management-languages error:',
            res.status,
            await res.text().catch(() => '')
          );
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
          languages: string[];
          mainLanguage?: string;
        };

        const rawLanguages = Array.isArray(data.languages)
          ? data.languages
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
      } catch (err) {
        console.error('Fehler beim Laden der Content-Sprachen:', err);
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

  const localized = coerceToLocalizedHtml(value);
  const currentHtml = getLocalizedHtml(localized, activeLang);

  const handleEditorChange = (html: string) => {
    const next = setLocalizedHtml(localized, activeLang, html);
    onChange(next);
  };

  const hasAnyContent = Object.values(localized).some(
    (v) => v && v.trim() !== ''
  );

  // Tabs für LanguageTabs vorbereiten
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

  /**
   * Wird vom AI-Translate Button ausgelöst.
   * Wenn target === 'all' → in alle Sprachen **außer** der Quellsprache.
   * Sonst nur in die spezifische Zielsprache.
   */
  const handleAiTranslateClick = async (
    source: LanguageCode,
    target: TranslateTarget
  ) => {
    if (isTranslating) return;

    const textToTranslate = getLocalizedHtml(localized, source);
    if (!textToTranslate.trim()) {
      console.log(
        '[AI-Translate] Abgebrochen: Kein Text in der Quellsprache vorhanden.'
      );
      return;
    }

    const targetLanguages: LanguageCode[] =
      target === 'all'
        ? availableLanguages.filter((lang) => lang !== source) // 🔥 Quellsprache ignorieren
        : availableLanguages.includes(target) && target !== source
          ? [target]
          : [];

    if (!targetLanguages.length) {
      console.log(
        '[AI-Translate] Abgebrochen: Keine gültigen Zielsprachen gefunden.',
        { target, source, availableLanguages }
      );
      return;
    }

    setIsTranslating(true);
    setPendingAi(null);

    try {
      const res = await fetch('/api/ai/translate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: translateFieldKey,
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguages,
        }),
      });

      if (!res.ok) {
        console.log(
          '[AI-Translate] Fehler beim Übersetzungs-Request (HTTP-Status):',
          res.status
        );
        return;
      }

      const data = (await res.json()) as Record<string, Record<string, string>>;

      const translations = data[translateFieldKey] ?? {};
      if (!translations || typeof translations !== 'object') {
        console.log('[AI-Translate] Unerwartetes Antwortformat der API:', data);
        return;
      }

      const result: Record<string, string> = {};

      for (const [lang, html] of Object.entries(translations)) {
        const lc = lang as LanguageCode;
        if (!targetLanguages.includes(lc)) continue;
        if (typeof html !== 'string' || !html.trim()) continue;
        result[lc] = html.trim();
      }

      if (!Object.keys(result).length) {
        console.log(
          '[AI-Translate] Keine verwertbaren Übersetzungen erhalten:',
          translations
        );
        return;
      }

      setPendingAi({
        source,
        target,
        targetLanguages,
        translations: result,
      });
      setPreviewExpanded(true); // beim neuen Durchlauf automatisch aufklappen
    } catch (err) {
      console.log('[AI-Translate] Unerwarteter Fehler beim Übersetzen:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // 🔎 Vorschlag für die aktuell aktive Sprache
  const currentSuggestion = pendingAi?.translations?.[activeLang] ?? undefined;

  const handleApplyCurrentSuggestion = () => {
    if (!pendingAi || !currentSuggestion) return;

    const next = setLocalizedHtml(localized, activeLang, currentSuggestion);

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

    onChange(next);
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

    let next: LocalizedHtml = { ...localized };

    for (const [lang, html] of Object.entries(pendingAi.translations)) {
      const lc = lang as LanguageCode;
      next = setLocalizedHtml(next, lc, html);
    }

    onChange(next);
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
    if (!textToTranslate.trim()) {
      console.log(
        '[AI-Translate] Retry abgebrochen: Kein Text in der Quellsprache vorhanden.'
      );
      return;
    }

    const targetLanguage: LanguageCode = activeLang;

    setIsTranslating(true);

    try {
      const res = await fetch('/api/ai/translate-field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: translateFieldKey,
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguages: [targetLanguage],
        }),
      });

      if (!res.ok) {
        console.log(
          '[AI-Translate] Fehler beim Retry-Übersetzungs-Request (HTTP-Status):',
          res.status
        );
        return;
      }

      const data = (await res.json()) as Record<string, Record<string, string>>;

      const translations = data[translateFieldKey] ?? {};
      if (!translations || typeof translations !== 'object') {
        console.log(
          '[AI-Translate] Unerwartetes Antwortformat beim Retry:',
          data
        );
        return;
      }

      const newHtml = translations[targetLanguage];
      if (typeof newHtml !== 'string' || !newHtml.trim()) {
        console.log(
          '[AI-Translate] Retry: keine verwertbare Übersetzung für',
          targetLanguage,
          translations
        );
        return;
      }

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
    } catch (err) {
      console.log(
        '[AI-Translate] Unerwarteter Fehler beim Retry-Übersetzen:',
        err
      );
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

      {/* TipTap-Editor für die aktive Sprache */}
      <RichTextEditor
        multiline={multiline}
        value={currentHtml}
        onChange={handleEditorChange}
      />

      {/* Vorschau UNTER dem Editor, für die aktuell aktive Sprache */}
      {pendingAi && currentSuggestion && (
        <AiPreviewContainer>
          <AiPreviewHeader>
            <strong>AI-Vorschlag für {activeLang.toUpperCase()}</strong>
            <AiPreviewHeaderRight>
              {suggestionsCount > 1 && (
                <span
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                  }}
                >
                  {suggestionsCount} offene Vorschläge
                </span>
              )}
              <AiPreviewToggleButton
                type="button"
                $expanded={previewExpanded}
                onClick={() => setPreviewExpanded((prev) => !prev)}
                aria-label={
                  previewExpanded
                    ? 'Vorschau einklappen'
                    : 'Vorschau ausklappen'
                }
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
                Du kannst Text hier direkt markieren und kopieren. Mit „In
                dieses Feld übernehmen“ wird nur die aktuell ausgewählte Sprache
                überschrieben. „Noch mal übersetzen“ aktualisiert nur diese
                Sprache, andere Vorschläge bleiben erhalten.
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
                  Vorschlag für {activeLang.toUpperCase()} verwerfen
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
                      Alle Übersetzungsvorschläge verwerfen
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

export default MultiLanguageRichTextEditorBlock;

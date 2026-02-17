// components/ai-translate/useAiTranslateField.ts
'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LanguageCode } from '@/components/language-settings/languages';
import { TranslateTarget } from '@/components/ai-translate/AiTranslate';

export type PendingAiTranslations = {
  source: LanguageCode;
  target: TranslateTarget;
  targetLanguages: LanguageCode[];
  translations: Record<string, string>; // lang -> text/html
};

type UseAiTranslateFieldParams = {
  translateFieldKey: string;
  availableLanguages: LanguageCode[];
  activeLang: LanguageCode;

  /** Text/HTML der Quellsprache holen (z.B. aus localized[lang]) */
  getTextForLanguage: (lang: LanguageCode) => string;

  /**
   * Wird bei "Übernehmen" / "Alle übernehmen" aufgerufen.
   * Du entscheidest in der Komponente, wie du in dein Localized-Objekt schreibst.
   */
  applyTranslation: (lang: LanguageCode, text: string) => void;
  applyTranslationsBulk: (translations: Record<LanguageCode, string>) => void;
};

export function useAiTranslateField({
  translateFieldKey,
  availableLanguages,
  activeLang,
  getTextForLanguage,
  applyTranslation,
  applyTranslationsBulk,
}: UseAiTranslateFieldParams) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingAi, setPendingAi] = useState<PendingAiTranslations | null>(
    null
  );
  const [previewExpanded, setPreviewExpanded] = useState(true);

  // WorkspaceId aus URL extrahieren für AI-Logging
  const pathname = usePathname();
  const workspaceId = pathname?.match(/\/workspaces\/([^/]+)/)?.[1] ?? '';

  const currentSuggestion = pendingAi?.translations?.[activeLang] ?? undefined;

  const suggestionsCount = useMemo(
    () => (pendingAi ? Object.keys(pendingAi.translations).length : 0),
    [pendingAi]
  );

  const hasPendingSuggestionFor = (lang: LanguageCode) =>
    !!pendingAi?.translations?.[lang];

  const handleAiTranslateClick = async (
    source: LanguageCode,
    target: TranslateTarget
  ) => {
    if (isTranslating) return;

    const textToTranslate = getTextForLanguage(source);
    if (!textToTranslate.trim()) {
      // eslint-disable-next-line no-console
      console.log(
        '[AI-Translate] Abgebrochen: Kein Text in der Quellsprache vorhanden.'
      );
      return;
    }

    const targetLanguages: LanguageCode[] =
      target === 'all'
        ? availableLanguages.filter((l) => l !== source)
        : availableLanguages.includes(target as LanguageCode) &&
          target !== source
        ? [target as LanguageCode]
        : [];

    if (!targetLanguages.length) {
      // eslint-disable-next-line no-console
      console.log(
        '[AI-Translate] Abgebrochen: Keine gültigen Zielsprachen gefunden.',
        {
          target,
          source,
          availableLanguages,
        }
      );
      return;
    }

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
          workspaceId,
        }),
      });

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.log(
          '[AI-Translate] Fehler beim Übersetzungs-Request:',
          res.status
        );
        return;
      }

      const data = (await res.json()) as Record<string, Record<string, string>>;
      const translations = data[translateFieldKey] ?? {};

      if (!translations || typeof translations !== 'object') {
        // eslint-disable-next-line no-console
        console.log('[AI-Translate] Unerwartetes Antwortformat:', data);
        return;
      }

      const result: Record<string, string> = {};

      for (const [lang, text] of Object.entries(translations)) {
        const lc = lang as LanguageCode;
        if (!targetLanguages.includes(lc)) continue;
        if (typeof text !== 'string' || !text.trim()) continue;
        result[lc] = text.trim();
      }

      if (!Object.keys(result).length) {
        // eslint-disable-next-line no-console
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

      setPreviewExpanded(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('[AI-Translate] Unerwarteter Fehler:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRetryCurrentSuggestion = async () => {
    if (!pendingAi) return;
    if (isTranslating) return;

    const source = pendingAi.source;
    const textToTranslate = getTextForLanguage(source);
    if (!textToTranslate.trim()) {
      // eslint-disable-next-line no-console
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: translateFieldKey,
          text: textToTranslate,
          sourceLanguage: source,
          targetLanguages: [targetLanguage],
          workspaceId,
        }),
      });

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.log('[AI-Translate] Fehler beim Retry (HTTP):', res.status);
        return;
      }

      const data = (await res.json()) as Record<string, Record<string, string>>;
      const translations = data[translateFieldKey] ?? {};

      const newText = translations[targetLanguage];
      if (typeof newText !== 'string' || !newText.trim()) {
        // eslint-disable-next-line no-console
        console.log(
          '[AI-Translate] Retry: keine verwertbare Übersetzung:',
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
            [targetLanguage]: newText.trim(),
          },
        };
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('[AI-Translate] Retry Fehler:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyCurrentSuggestion = () => {
    if (!pendingAi || !currentSuggestion) return;

    applyTranslation(activeLang, currentSuggestion);

    const newTranslations = { ...pendingAi.translations };
    delete newTranslations[activeLang];

    const remaining = Object.keys(newTranslations);
    setPendingAi(
      remaining.length
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

  const handleDiscardCurrentSuggestion = () => {
    if (!pendingAi || !currentSuggestion) return;

    const newTranslations = { ...pendingAi.translations };
    delete newTranslations[activeLang];

    const remaining = Object.keys(newTranslations);
    setPendingAi(
      remaining.length
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

    const bulk: Record<LanguageCode, string> = {} as Record<
      LanguageCode,
      string
    >;
    for (const [lang, text] of Object.entries(pendingAi.translations)) {
      bulk[lang as LanguageCode] = text;
    }

    applyTranslationsBulk(bulk);
    setPendingAi(null);
  };

  const handleDiscardAllSuggestions = () => {
    if (!pendingAi) return;
    setPendingAi(null);
  };

  return {
    isTranslating,
    pendingAi,
    currentSuggestion,
    suggestionsCount,
    previewExpanded,
    setPreviewExpanded,
    hasPendingSuggestionFor,

    handleAiTranslateClick,
    handleRetryCurrentSuggestion,
    handleApplyCurrentSuggestion,
    handleDiscardCurrentSuggestion,
    handleApplyAllSuggestions,
    handleDiscardAllSuggestions,
  };
}

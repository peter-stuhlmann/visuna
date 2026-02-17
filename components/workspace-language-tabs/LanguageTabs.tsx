'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { LanguageCode } from '../language-settings/languages';
import AiTranslate, {
  LanguageOption,
  TranslateTarget,
} from '../ai-translate/AiTranslate';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';

/**
 * Tab-Item speziell für Sprachen.
 * key ist bewusst ein LanguageCode.
 */
export type TabItem = {
  /** Sprachcode, z.B. "de", "en" */
  key: LanguageCode;
  /** Label im Tab, z.B. "DE", "EN" */
  label: string;
  /** Optional: Warn-Indikator (z.B. wenn kein eigener Inhalt vorhanden ist) */
  warning?: boolean;
  /** Optional: true, wenn es eine unbestätigte AI-Übersetzung gibt */
  hasPendingSuggestion?: boolean;
};

type LanguageTabsProps = {
  tabs: TabItem[];
  activeKey: LanguageCode;
  onChange: (key: LanguageCode) => void;
  /** Optional: kleiner Text über den Tabs (z.B. "Sprachen") */
  label?: string;
  sourceLanguageCode: LanguageCode;
  targetLanguageCode: LanguageCode;
  /** Wird von MultiLanguageRichTextEditorBlock durchgereicht */
  onTranslateClick?: (source: LanguageCode, target: TranslateTarget) => void;
  /** Loading-State vom AI-Request */
  loading?: boolean;
  /** Hauptsprache (für Sortierung) */
  mainLanguageCode?: LanguageCode;
};

const TabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 4px;
  margin-bottom: 4px;
`;

const LanguageTabs: React.FC<LanguageTabsProps> = ({
  tabs,
  activeKey,
  sourceLanguageCode,
  targetLanguageCode,
  onChange,
  onTranslateClick,
  loading = false,
  mainLanguageCode,
}) => {
  // Tabs sortieren: mainLanguage zuerst, Rest alphabetisch
  const sortedTabs = React.useMemo(() => {
    if (!mainLanguageCode) return [...tabs];

    const main = tabs.find((t) => t.key === mainLanguageCode);
    const others = tabs
      .filter((t) => t.key !== mainLanguageCode)
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));

    return main ? [main, ...others] : others;
  }, [tabs, mainLanguageCode]);

  const sortedKeys = React.useMemo(
    () => sortedTabs.map((t) => t.key),
    [sortedTabs]
  );

  const languageOptions: LanguageOption[] = React.useMemo(
    () => sortedTabs.map((tab) => ({ code: tab.key, label: tab.label })),
    [sortedTabs]
  );

  // Sync with global language changes (preview, PageDock, external preview)
  useEffect(() => {
    const onRemoteLang = (e: Event) => {
      const lang = (e as CustomEvent<{ language: LanguageCode }>).detail?.language;
      if (lang && lang !== activeKey && sortedTabs.some((t) => t.key === lang)) {
        onChange(lang);
      }
    };
    window.addEventListener('preview-language-change', onRemoteLang as EventListener);
    return () => window.removeEventListener('preview-language-change', onRemoteLang as EventListener);
  }, [activeKey, onChange, sortedTabs]);

  const handleChange = (key: LanguageCode) => {
    if (loading) return;
    onChange(key);
    // Broadcast language change to sync all LanguageTabs, preview, PageDock, etc.
    window.dispatchEvent(
      new CustomEvent('preview-language-change', { detail: { language: key } })
    );
  };

  return (
    <TabsWrapper>
      <LanguageSwitcher
        languages={sortedKeys}
        activeLanguage={activeKey}
        onLanguageChange={handleChange}
        disabled={loading}
      />

      {languageOptions.length > 0 && (
        <AiTranslate
          languages={languageOptions}
          sourceLanguageCode={sourceLanguageCode}
          targetLanguageCode={targetLanguageCode}
          onTranslateClick={onTranslateClick}
          loading={loading}
        />
      )}
    </TabsWrapper>
  );
};

export default LanguageTabs;

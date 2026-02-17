// components/workspace/LanguageSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';

type LanguageSettingsProps = {
  workspaceId: string;
  initialFrontend: LanguageCode[];
  initialContent: LanguageCode[];
  initialMainLanguage: LanguageCode;
};

type LanguageState = {
  frontend: LanguageCode[];
  content: LanguageCode[];
  mainLanguage: LanguageCode;
};

const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  workspaceId,
  initialFrontend,
  initialContent,
  initialMainLanguage,
}) => {
  const computeInitialState = (): LanguageState => {
    let content =
      initialContent.length > 0 ? [...initialContent] : [...DEFAULT_LANGUAGES];

    let frontend =
      initialFrontend.length > 0 ? [...initialFrontend] : [...content];

    // Sicherheitsnetz: frontend ⊆ content
    frontend = frontend.filter((f) => content.includes(f));
    if (!frontend.length) frontend = [content[0]];

    let mainLanguage: LanguageCode;

    if (content.includes(initialMainLanguage)) {
      mainLanguage = initialMainLanguage;
    } else {
      mainLanguage = content[0];
    }

    // Hauptsprache muss auch Frontend sein
    if (!frontend.includes(mainLanguage)) {
      frontend.push(mainLanguage);
    }

    return {
      frontend: Array.from(new Set(frontend)),
      content: Array.from(new Set(content)),
      mainLanguage,
    };
  };

  const [state, setState] = useState<LanguageState>(() =>
    computeInitialState()
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState(computeInitialState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, initialFrontend, initialContent, initialMainLanguage]);

  // 🔒 ZENTRALE VALIDIERUNG
  const isValidState = (next: LanguageState): boolean => {
    if (!next.content.length) return false;
    if (!next.frontend.length) return false;

    // frontend ⊆ content
    if (next.frontend.some((f) => !next.content.includes(f))) return false;

    // mainLanguage ∈ content
    if (!next.content.includes(next.mainLanguage)) return false;

    return true;
  };

  const saveLanguages = async (next: LanguageState) => {
    if (!isValidState(next)) {
      console.warn('INVALID SAVE PREVENTED', next);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch(`/api/workspaces/${workspaceId}/languages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontendLanguages: next.frontend,
          contentLanguages: next.content,
          mainLanguage: next.mainLanguage,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('SAVE ERROR', text);
        setError('Die Sprach-Einstellungen konnten nicht gespeichert werden.');
      }
    } catch (err) {
      console.error('SAVE FAILED', err);
      setError('Die Sprach-Einstellungen konnten nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  const isOnlyFrontendSelected = (code: LanguageCode) =>
    state.frontend.length === 1 && state.frontend[0] === code;

  const isOnlyContentSelected = (code: LanguageCode) =>
    state.content.length === 1 && state.content[0] === code;

  const handleToggleFrontend = (code: LanguageCode) => {
    setState((prev) => {
      let frontend = prev.frontend.includes(code)
        ? prev.frontend.filter((c) => c !== code)
        : [...prev.frontend, code];

      if (!frontend.length) return prev;

      let content = prev.content;
      if (frontend.includes(code) && !content.includes(code)) {
        content = [...content, code];
      }

      const next: LanguageState = {
        frontend: Array.from(new Set(frontend)),
        content: Array.from(new Set(content)),
        mainLanguage: prev.mainLanguage,
      };

      saveLanguages(next);
      return next;
    });
  };

  const handleToggleContent = (code: LanguageCode) => {
    setState((prev) => {
      let content = prev.content.includes(code)
        ? prev.content.filter((c) => c !== code)
        : [...prev.content, code];

      if (!content.length) return prev;

      let frontend = prev.frontend.filter((f) => content.includes(f));
      if (!frontend.length) frontend = [content[0]];

      let mainLanguage = prev.mainLanguage;
      if (!content.includes(mainLanguage)) {
        mainLanguage = content[0];
      }

      const next: LanguageState = {
        frontend: Array.from(new Set(frontend)),
        content: Array.from(new Set(content)),
        mainLanguage,
      };

      saveLanguages(next);
      return next;
    });
  };

  const handleSetMainLanguage = (code: LanguageCode) => {
    setState((prev) => {
      let content = prev.content;
      let frontend = prev.frontend;

      if (!content.includes(code)) content = [...content, code];
      if (!frontend.includes(code)) frontend = [...frontend, code];

      const next: LanguageState = {
        frontend: Array.from(new Set(frontend)),
        content: Array.from(new Set(content)),
        mainLanguage: code,
      };

      saveLanguages(next);
      return next;
    });
  };

  return (
    <Section>
      <Title>Sprachen-Einstellungen</Title>

      {error && <ErrorText>{error}</ErrorText>}

      <CardsGrid>
        {ALL_LANGUAGES.map((lang) => {
          const frontendChecked = state.frontend.includes(lang.code);
          const contentChecked = state.content.includes(lang.code);
          const isMain = state.mainLanguage === lang.code;

          return (
            <LanguageCard
              key={lang.code}
              $active={frontendChecked || contentChecked}
            >
              <LanguageHeader>
                <LanguageLabel>{lang.label}</LanguageLabel>
                <MainLanguageButton
                  onClick={() => handleSetMainLanguage(lang.code)}
                >
                  {isMain ? '★' : '☆'}
                </MainLanguageButton>
              </LanguageHeader>

              <LanguageOptionsRow>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={frontendChecked}
                    disabled={isOnlyFrontendSelected(lang.code)}
                    onChange={() => handleToggleFrontend(lang.code)}
                  />
                  Frontend
                </CheckboxLabel>

                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={contentChecked}
                    disabled={isOnlyContentSelected(lang.code)}
                    onChange={() => handleToggleContent(lang.code)}
                  />
                  Content
                </CheckboxLabel>
              </LanguageOptionsRow>
            </LanguageCard>
          );
        })}
      </CardsGrid>

      {isSaving && <SavingText>Änderungen werden gespeichert …</SavingText>}
    </Section>
  );
};

export default LanguageSettings;

/* styled-components */

const Section = styled.section`
  margin-top: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #b00020;
  margin-bottom: 8px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
`;

const LanguageCard = styled.div<{ $active: boolean }>`
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: ${({ $active }) => ($active ? '#f5f9ff' : '#fafafa')};
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
`;

const LanguageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageLabel = styled.span`
  font-size: 14px;
`;

const MainLanguageButton = styled.button`
  margin-left: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
`;

const LanguageOptionsRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SavingText = styled.p`
  font-size: 12px;
  color: #555;
  margin-top: 8px;
`;

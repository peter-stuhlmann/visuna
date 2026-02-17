'use client';

import React from 'react';
import styled from 'styled-components';
import { AI_ICON } from '@/lib/constants';
import { useClientStorage } from '@/components/content-elements/default/utils/useLocalStorage';
import { LanguageCode } from '../language-settings/languages';

export type LanguageOption = {
  code: LanguageCode;
  label: string;
};

/**
 * Ziel kann eine konkrete Sprache oder "all" sein.
 */
export type TranslateTarget = LanguageCode | 'all';

type AiTranslateProps = {
  /** Verfügbare Sprachen (z.B. aus den Tabs) */
  languages: LanguageOption[];
  /** Start-Wert für Ausgangssprache (z.B. mainLang) */
  sourceLanguageCode: LanguageCode;
  /** Zielsprache – kommt z.B. vom aktiven Tab */
  targetLanguageCode: LanguageCode;
  /**
   * Wird aufgerufen, wenn auf den Übersetzen-Button geklickt wird.
   * target ist entweder eine konkrete Sprache oder 'all'.
   */
  onTranslateClick?: (source: LanguageCode, target: TranslateTarget) => void;
  /**
   * Ob gerade eine Anfrage läuft.
   * → Button + Selects disabled + Spinner.
   */
  loading?: boolean;
};

const AiTranslateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TabWithMenu = styled.div`
  position: relative;
`;

const LanguageTabButton = styled.button<{ $active?: boolean }>`
  width: 30px;
  height: 30px;
  font-size: 11px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? '#0070f3' : '#d1d5db')};
  background-color: ${({ $active }) => ($active ? '#e6f0ff' : '#f3f4f6')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#d6e6ff' : '#e5e7eb')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    background-color: #f3f4f6;
  }
`;

const LanguageMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 4px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const LanguageMenuItem = styled.button`
  width: 30px;
  height: 30px;
  text-align: center;
  padding: 0;
  font-size: 11px;
  cursor: pointer;
  border-radius: 8px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const ArrowColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  line-height: 1;
  margin-top: 5px;
`;

const ArrowIcon = styled.span`
  font-size: 12px;
  line-height: 1;
`;

const ArrowText = styled.span`
  font-size: 14px;
  line-height: 1;
  color: #515761ff;
`;

const TranslateIconButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  line-height: 1;

  &:hover {
    background-color: #e5e7eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    background-color: #f3f4f6;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid #9ca3af;
  border-top-color: #111827;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AiTranslate: React.FC<AiTranslateProps> = ({
  languages,
  sourceLanguageCode,
  targetLanguageCode,
  onTranslateClick,
  loading = false,
}) => {
  const [openMenu, setOpenMenu] = React.useState<'source' | 'target' | null>(
    null
  );

  const [source, setSource] = useClientStorage<string>(
    'ai-translate-source', sourceLanguageCode, 'local'
  );
  const [target, setTarget] = useClientStorage<string>(
    'ai-translate-target', 'all', 'local'
  );

  if (!languages || languages.length === 0) {
    return null;
  }

  const getLabel = (code?: string) => {
    if (!code) return '?';
    if (code === 'all') return '★';
    return code.toUpperCase();
  };

  const getMenuLabel = (code: LanguageCode | 'all') => {
    if (code === 'all') return '★';
    return code.toUpperCase();
  };

  const handleSelect = (
    type: 'source' | 'target',
    code: LanguageCode | 'all'
  ) => {
    if (type === 'source') {
      if (code === 'all') return; // Quelle kann nicht "all" sein
      setSource(code);
    } else {
      setTarget(code);
    }
    setOpenMenu(null);
  };

  const handleTranslateClick = () => {
    if (!source || !onTranslateClick || loading) return;
    onTranslateClick(source as LanguageCode, target as TranslateTarget);
  };

  const toggleMenu = (type: 'source' | 'target') => {
    if (loading) return;
    setOpenMenu((prev) => (prev === type ? null : type));
  };

  return (
    <AiTranslateWrapper>
      {/* Ausgangssprache */}
      <TabWithMenu>
        <LanguageTabButton
          type="button"
          $active={openMenu === 'source'}
          onClick={() => toggleMenu('source')}
          disabled={loading}
        >
          <span>{getLabel(source)}</span>
        </LanguageTabButton>

        {openMenu === 'source' && (
          <LanguageMenu>
            {languages.map((lang) => (
              <LanguageMenuItem
                key={lang.code}
                type="button"
                onClick={() => handleSelect('source', lang.code)}
              >
                {getMenuLabel(lang.code)}
              </LanguageMenuItem>
            ))}
          </LanguageMenu>
        )}
      </TabWithMenu>

      <ArrowColumn>
        <ArrowIcon>🌐</ArrowIcon>
        <ArrowText>→</ArrowText>
      </ArrowColumn>

      {/* Zielsprache */}
      <TabWithMenu>
        <LanguageTabButton
          type="button"
          $active={openMenu === 'target'}
          onClick={() => toggleMenu('target')}
          disabled={loading}
        >
          <span>{getLabel(target)}</span>
        </LanguageTabButton>

        {openMenu === 'target' && (
          <LanguageMenu>
            {/* "All" Option */}
            <LanguageMenuItem
              key="all"
              type="button"
              onClick={() => handleSelect('target', 'all')}
            >
              {getMenuLabel('all')}
            </LanguageMenuItem>
            {languages.map((lang) => (
              <LanguageMenuItem
                key={lang.code}
                type="button"
                onClick={() => handleSelect('target', lang.code)}
              >
                {getMenuLabel(lang.code)}
              </LanguageMenuItem>
            ))}
          </LanguageMenu>
        )}
      </TabWithMenu>

      {/* IconButton rechts */}
      <TranslateIconButton
        type="button"
        onClick={handleTranslateClick}
        aria-label="AI-Übersetzung starten"
        disabled={loading}
      >
        {loading ? (
          <Spinner />
        ) : (
          <span>{AI_ICON}</span>
        )}
      </TranslateIconButton>
    </AiTranslateWrapper>
  );
};

export default AiTranslate;

// components/ai-translate/AiTranslationPreview.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import { LanguageCode } from '@/components/language-settings/languages';

type Mode = 'html' | 'text';

type AiTranslationPreviewProps = {
  mode: Mode;

  activeLang: LanguageCode;

  // preview state
  expanded: boolean;
  onToggleExpanded: () => void;

  // content
  suggestion?: string;
  suggestionsCount: number;

  // states
  isTranslating: boolean;

  // actions
  onRetry: () => void;
  onDiscardCurrent: () => void;
  onApplyCurrent: () => void;
  onApplyAll?: () => void; // optional, falls count > 1
  onDiscardAll?: () => void; // optional, falls count > 1
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

/**
 * HTML Preview Styles (wie bei deinem RTE)
 */
const HtmlPreviewContent = styled.div`
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
    font-family: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #f3f4f6;
    padding: 2px 4px;
    border-radius: 3px;
  }

  pre {
    font-family: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
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

/**
 * Plain Text Preview
 */
const TextPreviewContent = styled.pre`
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
  margin-top: 4px;
`;

const defaultHint =
  'Du kannst Text hier direkt markieren und kopieren. Mit „In dieses Feld übernehmen“ wird nur die aktuell ausgewählte Sprache überschrieben. „Noch mal übersetzen“ aktualisiert nur diese Sprache, andere Vorschläge bleiben erhalten.';

const AiTranslationPreview: React.FC<AiTranslationPreviewProps> = ({
  mode,
  activeLang,
  expanded,
  onToggleExpanded,
  suggestion,
  suggestionsCount,
  isTranslating,
  onRetry,
  onDiscardCurrent,
  onApplyCurrent,
  onApplyAll,
  onDiscardAll,
}) => {
  if (!suggestion) return null;

  return (
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
            $expanded={expanded}
            onClick={onToggleExpanded}
            aria-label={
              expanded ? 'Vorschau einklappen' : 'Vorschau ausklappen'
            }
          >
            ▾
          </AiPreviewToggleButton>
        </AiPreviewHeaderRight>
      </AiPreviewHeader>

      {expanded && (
        <>
          {mode === 'html' ? (
            <HtmlPreviewContent
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: suggestion }}
            />
          ) : (
            <TextPreviewContent>{suggestion}</TextPreviewContent>
          )}

          <AiPreviewHint>{defaultHint}</AiPreviewHint>

          <AiPreviewActions>
            <AiPreviewButton
              type="button"
              onClick={onRetry}
              $variant="ghost"
              disabled={isTranslating}
            >
              Noch mal übersetzen (nur {activeLang.toUpperCase()})
            </AiPreviewButton>

            <AiPreviewButton
              type="button"
              onClick={onDiscardCurrent}
              $variant="ghost"
              disabled={isTranslating}
            >
              Vorschlag für {activeLang.toUpperCase()} verwerfen
            </AiPreviewButton>

            <AiPreviewButton
              type="button"
              onClick={onApplyCurrent}
              $variant="primary"
              disabled={isTranslating}
            >
              In dieses Feld übernehmen
            </AiPreviewButton>

            {suggestionsCount > 1 && onApplyAll && onDiscardAll && (
              <>
                <AiPreviewButton
                  type="button"
                  onClick={onApplyAll}
                  $variant="secondary"
                  disabled={isTranslating}
                >
                  Alle Vorschläge übernehmen
                </AiPreviewButton>

                <AiPreviewButton
                  type="button"
                  onClick={onDiscardAll}
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
  );
};

export default AiTranslationPreview;

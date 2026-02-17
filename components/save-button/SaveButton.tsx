'use client';

import { FC } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { MdCheck } from 'react-icons/md';

export type SaveButtonStatus = 'idle' | 'saving' | 'saved';

interface SaveButtonProps {
  /** Current status of the button */
  status: SaveButtonStatus;
  /** Are there unsaved changes? Controls gray (dirty) vs green (saved) state */
  hasChanges: boolean;
  /** Click handler — only fires when hasChanges is true and not currently saving */
  onClick: () => void;
  /** Label shown in idle/dirty state (default: "Speichern") */
  label?: string;
  /** Label shown while saving (default: "Speichern …") */
  savingLabel?: string;
  /** Label shown after save (default: "Gespeichert") */
  savedLabel?: string;
}

const SaveButton: FC<SaveButtonProps> = ({
  status,
  hasChanges,
  onClick,
  label = 'Speichern',
  savingLabel = 'Speichern …',
  savedLabel = 'Gespeichert',
}) => {
  const isDisabled = status === 'saving' || (status === 'saved' && !hasChanges);
  const isSaved = status === 'saved' && !hasChanges;

  return (
    <StyledButton
      type="button"
      $saved={isSaved}
      disabled={isDisabled}
      onClick={onClick}
    >
      {status === 'saving' ? (
        savingLabel
      ) : isSaved ? (
        <>
          <MdCheck size={16} />
          {savedLabel}
        </>
      ) : (
        label
      )}
    </StyledButton>
  );
};

export default SaveButton;

/* ---------- Styles ---------- */

const fadeToGreen = keyframes`
  from { background: #f0f0f0; border-color: #ccc; color: #333; }
  to   { background: #ecfdf5; border-color: #6ee7b7; color: #047857; }
`;

const StyledButton = styled.button<{ $saved: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 0.3rem;
  border: 1px solid #ccc;
  background: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover:not(:disabled) {
    background: #e2e2e2;
  }

  &:disabled {
    cursor: default;
  }

  ${({ $saved }) =>
    $saved &&
    css`
      animation: ${fadeToGreen} 0.3s ease forwards;
      cursor: default;
      opacity: 1;

      &:hover {
        background: #ecfdf5;
      }
    `}
`;

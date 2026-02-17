'use client';

import { FC, ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

export type DeleteConfirmModalProps = {
  /** Controls visibility */
  isOpen: boolean;
  /** Title shown in the modal header */
  title: string;
  /** Main description / warning text */
  message?: ReactNode;
  /** Optional extra content (e.g. a list of affected items) */
  children?: ReactNode;
  /** Label for the confirm button (default: "Löschen") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Abbrechen") */
  cancelLabel?: string;
  /** Whether the confirm action is currently running */
  isLoading?: boolean;
  /** Called when the user confirms deletion */
  onConfirm: () => void;
  /** Called when the user cancels */
  onCancel: () => void;
};

const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  children,
  confirmLabel = 'Löschen',
  cancelLabel = 'Abbrechen',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    },
    [isLoading, onCancel]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={() => !isLoading && onCancel()}>
      <Dialog onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <Title>{title}</Title>

        {message && <Message>{message}</Message>}

        {children && <Content>{children}</Content>}

        <Actions>
          <CancelButton type="button" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </CancelButton>
          <ConfirmButton type="button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Wird gelöscht…' : confirmLabel}
          </ConfirmButton>
        </Actions>
      </Dialog>
    </Overlay>,
    document.body
  );
};

export default DeleteConfirmModal;

/* ---------- Animations ---------- */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ---------- Styles ---------- */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: ${fadeIn} 0.15s ease;
`;

const Dialog = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px 32px 24px;
  max-width: 480px;
  width: calc(100% - 32px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: ${slideUp} 0.2s ease;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
`;

const Message = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
`;

const Content = styled.div`
  margin-bottom: 20px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button`
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: #dc2626;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #b91c1c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

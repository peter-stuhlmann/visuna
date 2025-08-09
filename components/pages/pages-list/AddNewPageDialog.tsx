'use client';

import { Button, TextInput } from '@/components/content-elements/default';
import React, { FC } from 'react';
// import {
//   DialogBackdrop,
//   DialogBox,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   InputGroup,
//   Label,
//   Input,
//   ErrorText,
//   Button,
// } from './AddNewPageDialog.styles';
import styled from 'styled-components';

type AddNewPageDialogProps = {
  isOpen: boolean;
  handleClose: () => void;
  pageName: string;
  setPageName: (pageName: string) => void;
  nameError: string | null;
  slugError: string | null;
  slug: string;
  setSlug: (slug: string) => void;
  isSlugTaken: boolean;
  isLoading: boolean;
  handleSave: () => void;
};

const AddNewPageDialog: FC<AddNewPageDialogProps> = ({
  isOpen,
  handleClose,
  pageName,
  setPageName,
  nameError,
  slugError,
  slug,
  setSlug,
  isSlugTaken,
  isLoading,
  handleSave,
}) => {
  if (!isOpen) return null;

  return (
    <DialogBackdrop onClick={handleClose}>
      <DialogBox onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Neue Seite anlegen</DialogTitle>
        <DialogContent>
          <InputGroup>
            <TextInput
              id="pageName"
              value={pageName}
              onChange={(e) => setPageName(e)}
              label="Seitenname *"
              required
              autoFocus
            />
            {nameError && <ErrorText>{nameError}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <TextInput
              id="slug"
              label="Slug *"
              value={slug}
              onChange={(e) => setSlug(e)}
            />
            {(slugError || isSlugTaken) && (
              <ErrorText>
                {slugError || 'Dieser Slug ist bereits vergeben.'}
              </ErrorText>
            )}
          </InputGroup>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isLoading || !pageName.trim() || !slug.trim() || isSlugTaken
            }
          >
            {isLoading ? 'Wird gespeichert ...' : 'Speichern'}
          </Button>
        </DialogActions>
      </DialogBox>
    </DialogBackdrop>
  );
};

export default AddNewPageDialog;

export const DialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

export const DialogBox = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

export const DialogTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 20px;
`;

export const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 14px;
  margin-bottom: 4px;
`;

export const ErrorText = styled.span`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`;

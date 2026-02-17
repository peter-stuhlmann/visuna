'use client';

import { Button, Icon, TextInput } from '@/components/content-elements/default';
import { sampleTemplates } from '@/data/sampleTemplates';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
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
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
};

function slugifyGerman(input: string): string {
  const s = (input ?? '').trim().toLowerCase();

  // Umlaute + ß
  const replaced = s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

  // Optional: Akzente entfernen (z.B. é -> e), falls doch mal drin
  const withoutDiacritics = replaced
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    withoutDiacritics
      // alles was kein buchstabe/zahl ist -> -
      .replace(/[^a-z0-9]+/g, '-')
      // mehrere - zusammenfassen
      .replace(/-+/g, '-')
      // führende/trailing -
      .replace(/^-|-$/g, '')
  );
}

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
  selectedTemplateId,
  setSelectedTemplateId,
}) => {
  // Trackt, ob der User den Slug manuell editiert hat
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Merker für "Dialog neu geöffnet" -> Auto-Slug wieder aktivieren
  const wasOpenRef = useRef<boolean>(false);

  // Wenn Dialog frisch geöffnet wird: Auto-Slug wieder erlauben
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setSlugManuallyEdited(false);
      wasOpenRef.current = true;
    }
    if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen]);

  const computedSlugFromName = useMemo(
    () => slugifyGerman(pageName),
    [pageName]
  );

  const handleNameChange = (nextName: string) => {
    setPageName(nextName);

    // Nur auto-updaten, solange User den Slug nicht angefasst hat
    if (!slugManuallyEdited) {
      setSlug(slugifyGerman(nextName));
    }
  };

  const handleSlugChange = (nextSlug: string) => {
    // ab jetzt: Slug ist "user-controlled"
    if (!slugManuallyEdited) {
      setSlugManuallyEdited(true);
    }

    // auch beim manuellen Tippen slug "sauber" halten:
    // - lower
    // - spaces -> -
    // - umlaute -> ae/oe/ue/ss
    // - sonderzeichen raus
    setSlug(slugifyGerman(nextSlug));
  };

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
              onChange={(e) => handleNameChange(e)}
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
              onChange={(e) => handleSlugChange(e)}
            />

            {/* optionaler Hint, wenn auto-generiert */}
            {!slugManuallyEdited && pageName.trim() && (
              <HintText>
                Automatisch aus dem Namen erzeugt:{' '}
                <code>{computedSlugFromName || '—'}</code>
              </HintText>
            )}

            {(slugError || isSlugTaken) && (
              <ErrorText>
                {slugError || 'Dieser Slug ist bereits vergeben.'}
              </ErrorText>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Template</Label>
            <Templates>
              {sampleTemplates.map((template) => (
                <TemplateContainer
                  key={template.id}
                  $isSelected={selectedTemplateId === template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className="template-name">{template.name.de}</div>
                  <button className="info-icon">
                    <Icon name="MdInfoOutline" size={20} />
                  </button>
                </TemplateContainer>
              ))}
            </Templates>
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
            {isLoading ? 'Wird erstellt ...' : 'Seite erstellen'}
          </Button>
        </DialogActions>
      </DialogBox>
    </DialogBackdrop>
  );
};

export default AddNewPageDialog;

export const Templates = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const TemplateContainer = styled.div<{ $isSelected: boolean }>`
  background-color: #ebf1fd;
  padding: 5px 10px;
  border-radius: 10px;
  position: relative;
  border: ${({ $isSelected }) =>
    $isSelected ? '2px solid #3366ff' : '2px solid transparent'};
  cursor: pointer;

  .template-name {
    user-select: none;
  }

  .info-icon {
    position: absolute;
    z-index: 1;
    top: 3px;
    right: 3px;
    width: 30px;
    height: 30px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    border-radius: 50%;
    background: transparent;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;

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

export const HintText = styled.span`
  color: #666;
  font-size: 12px;
  margin-top: 6px;

  code {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 12px;
  }
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

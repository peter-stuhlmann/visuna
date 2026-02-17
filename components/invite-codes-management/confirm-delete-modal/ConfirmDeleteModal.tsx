import { FC } from 'react';

import {
  ModalActions,
  ModalContent,
  ModalOverlay,
} from './ConfirmDeleteModal.styles';
import { ConfirmDeleteModalProps } from './ConfirmDeleteModal.types';
import { Button, Heading } from '@/components/content-elements/default';

const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <Heading element="h2" value="Benutzer:in entfernen?" align="center" />

        <p>
          Du entfernst diese Person aus dem Workspace.
          <br />
          Sie verliert den Zugriff auf diesen Workspace.
          <br />
          Sie kann jederzeit über die E-Mail-Adresse wieder hinzugefügt werden.
        </p>

        <ModalActions>
          <Button type="button" variant="contained" onClick={onCancel}>
            Abbrechen
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={onConfirm}
            style={{ background: '#b91c1c' }}
          >
            Zugriff entziehen
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmDeleteModal;

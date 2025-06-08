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
        <Heading element="h2" value="Bist Du sicher?" />
        <p>
          Möchtest Du diese:n Benutzer:in wirklich löschen? Du kannst diesen
          Vorgang nicht rückgängig machen.
        </p>
        <ModalActions>
          <Button type="button" variant="contained" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="button" variant="contained" onClick={onConfirm}>
            Benutzer:in löschen
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmDeleteModal;

// components/pages/page-elements/components/EditElementModal.tsx
'use client';

import { FC, RefObject } from 'react';
import Modal from '@/components/Modal';
import {
  Button,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

import ContentElementSettingsWrapper, {
  ContentElementSettingsWrapperHandle,
} from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';

import { ModalBody, StickyBar } from '../PageElementsList.styles';

type EditElementModalProps = {
  open: boolean;
  editingElementId: string | null;
  onCancel: () => void;
  onSaveAndClose: () => void;
  // ✅ MUSS nullable sein, weil useRef(...null) => RefObject<T | null>
  settingsRef: RefObject<ContentElementSettingsWrapperHandle | null>;
  workspaceId: string;
  pageId: string;
};

const EditElementModal: FC<EditElementModalProps> = ({
  open,
  editingElementId,
  onCancel,
  onSaveAndClose,
  settingsRef,
  workspaceId,
  pageId,
}) => {
  if (!open || !editingElementId) return null;

  return (
    <Modal onClose={onCancel}>
      <ModalBody>
        <Wrapper
          data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
            },
            children: (
              <>
                <StickyBar>
                  <Button onClick={onCancel}>Abbrechen</Button>
                  <Button variant="contained" onClick={onSaveAndClose}>
                    Speichern und schließen
                  </Button>
                </StickyBar>

                <>
                  <Heading value="Seitenelement bearbeiten" element="h2" />
                  <ContentElementSettingsWrapper
                    ref={settingsRef}
                    handleCloseModal={onSaveAndClose}
                    onCancel={onCancel}
                    workspaceId={workspaceId}
                    pageId={pageId}
                  />
                </>
              </>
            ),
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default EditElementModal;

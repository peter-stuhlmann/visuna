// components/pages/page-elements/components/CreateElementModal.tsx
'use client';

import { FC } from 'react';
import Modal from '@/components/Modal';
import {
  Button,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import CreatePageClientWrapper from '@/components/pages/page-elements/components/CreatePageElementsList';
import { ModalBody, StickyBar } from '../PageElementsList.styles';

type CreateElementModalProps = {
  open: boolean;
  onClose: () => void;
  pageId: string;
  workspaceId: string;
};

const CreateElementModal: FC<CreateElementModalProps> = ({
  open,
  onClose,
  pageId,
  workspaceId,
}) => {
  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <ModalBody>
        <StickyBar>
          <Button onClick={onClose}>Schließen</Button>
        </StickyBar>

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
                <Heading value="Seitenelement erstellen" element="h2" />
                <CreatePageClientWrapper workspaceId={workspaceId} pageId={pageId} onCreated={onClose} />
              </>
            ),
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default CreateElementModal;

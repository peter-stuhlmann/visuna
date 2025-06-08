'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Workspace } from '@/types';
import { Button, Heading } from '../content-elements/default';
import TextInput from '../content-elements/default/inputs/text';
import { getPrimaryColor } from '../content-elements/default/constants';
import { useStatus } from '../status/StatusContext';

const DELETE_CONFIRM_2 = 'Workspace löschen';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const DialogContainer = styled.div<{ $backgroundColor: string }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding: 20px;
  border-radius: 1rem;
  position: fixed;
  z-index: 1000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
  width: 400px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const WorkspaceDeleteDialog: FC<{
  workspace: Workspace;
  setIsDeleteDialogOpen: (open: boolean) => void;
  backgroundColor?: string;
}> = ({
  workspace,
  setIsDeleteDialogOpen,
  backgroundColor = getPrimaryColor()['50'],
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [verificationConfirmation, setVerificationConfirmation] = useState('');
  const router = useRouter();
  const { addStatus } = useStatus();

  const confirmDeletion = async () => {
    if (
      deleteConfirmation !== workspace.name ||
      verificationConfirmation !== DELETE_CONFIRM_2
    )
      return;

    try {
      const res = await fetch(`/api/delete-workspace`, {
        method: 'POST',
        body: JSON.stringify({ id: workspace._id }),
      });
      if (res.ok) {
        addStatus({
          type: 'success',
          message: `Du hast den Workspace "${workspace.name}" gelöscht.`,
        });
        router.refresh();
      } else {
        addStatus({
          type: 'error',
          message: `Fehler beim Löschen von "${workspace.name}".`,
        });
      }
    } catch {
      addStatus({
        type: 'error',
        message: `Fehler beim Löschen von "${workspace.name}".`,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation('');
      setVerificationConfirmation('');
    }
  };

  return (
    <Backdrop onClick={() => setIsDeleteDialogOpen(false)}>
      <DialogContainer
        $backgroundColor={backgroundColor}
        onClick={(e) => e.stopPropagation()}
      >
        <Heading element="h3" value="Workspace löschen" />
        <p>
          Dieser Workspace wird gelöscht, zusammen mit allen zugehörigen Daten.
        </p>
        <p style={{ color: 'red' }}>
          Warnung: Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <p>
          Gib den Workspacenamen <strong>{workspace.name}</strong> ein, um
          fortzufahren:
        </p>
        <TextInput
          type="text"
          label="Workspace-Name"
          value={deleteConfirmation}
          onChange={setDeleteConfirmation}
          status={deleteConfirmation === workspace.name ? 'success' : 'error'}
        />
        <p>
          Zur Bestätigung, gib bitte <strong>{DELETE_CONFIRM_2}</strong> ein:
        </p>
        <TextInput
          type="text"
          label="Bestätigung"
          value={verificationConfirmation}
          onChange={setVerificationConfirmation}
          status={
            verificationConfirmation === DELETE_CONFIRM_2 ? 'success' : 'error'
          }
        />
        <ButtonGroup>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={confirmDeletion}
            disabled={
              deleteConfirmation !== workspace.name ||
              verificationConfirmation !== DELETE_CONFIRM_2
            }
          >
            Unwideruflich löschen
          </Button>
        </ButtonGroup>
      </DialogContainer>
    </Backdrop>
  );
};

export default WorkspaceDeleteDialog;

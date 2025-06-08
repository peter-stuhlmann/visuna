'use client';

import { FC, useState } from 'react';
import formatTimestamp from '@/utils/formatTimestamp';
import ConfirmDeleteModal from './confirm-delete-modal';
import { MdDelete, MdUndo } from 'react-icons/md';
import { useStatus } from '../status/StatusContext';
import { User, Workspace } from '@/types';
import {
  ActionButton,
  LoadingSpinner,
  StyledTable,
  TableWrapper,
} from './InvitedUserslist.styles';
import { ExtendedUser } from './InviteUsersManagement.types';

type InvitedUserslistProps = {
  users: User[] | null;
  setUsers: (users: User[]) => void;
  loggedInUser: User;
  workspace: Workspace;
};

const InvitedUserslist: FC<InvitedUserslistProps> = ({
  loggedInUser,
  users,
  setUsers,
  workspace,
}) => {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { addStatus } = useStatus();

  const deleteUser = async (email: string) => {
    setLoadingUserId(email);
    try {
      const response = await fetch(`/api/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.updatedUsers);
        addStatus({ type: 'success', message: data.message });
      } else {
        addStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const revokeInvitation = async (id: string) => {
    setLoadingUserId(id);
    try {
      const response = await fetch(`/api/revoke-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.updatedUsers);
        addStatus({ type: 'success', message: data.message });
      } else {
        addStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleOpenDeleteModal = (email: string) => {
    setUserToDelete(email);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) deleteUser(userToDelete);
    handleCloseDeleteModal();
  };

  return (
    <>
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              <th>E-Mail</th>
              <th>Eingeladen am</th>
              <th>Rolle</th>
              <th>Status</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>⭐ {loggedInUser.email}</td>
              <td></td>
              <td>
                {workspace?.access
                  ?.find((y) => y.userId === loggedInUser._id)
                  ?.role.toUpperCase() ?? '?'}
              </td>
              <td>Registriert</td>
              <td></td>
            </tr>
            {users && users.length > 1 ? (
              users
                .filter((us) => us._id !== loggedInUser._id)
                .map((user) => (
                  <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{formatTimestamp(user.createdAt as string)}</td>
                    <td>
                      {workspace?.access
                        ?.find((y) => y.userId === user._id)
                        ?.role.toUpperCase() ??
                        (user as ExtendedUser).tempRole?.toUpperCase() ??
                        '?'}
                    </td>
                    <td>{user.verified ? 'Registriert' : 'Ausstehend'}</td>
                    <td>
                      {loadingUserId === user._id ||
                      loadingUserId === user.email ? (
                        <LoadingSpinner />
                      ) : user.verified ? (
                        <ActionButton
                          aria-label="delete"
                          $color="red"
                          onClick={() =>
                            handleOpenDeleteModal(user.email as string)
                          }
                        >
                          <MdDelete size={20} />
                        </ActionButton>
                      ) : (
                        <ActionButton
                          aria-label="revoke"
                          $color="orange"
                          onClick={() => revokeInvitation(user._id as string)}
                        >
                          <MdUndo size={20} />
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Keine Mitarbeiter eingeladen
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </>
  );
};

export default InvitedUserslist;

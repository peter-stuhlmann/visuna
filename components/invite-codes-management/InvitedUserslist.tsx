'use client';

import { FC, useMemo, useState } from 'react';
import ConfirmDeleteModal from './confirm-delete-modal';
import { MdPersonRemove } from 'react-icons/md';
import { useStatus } from '../status/StatusContext';
import {
  ActionButton,
  ActionsCell,
  EmptyState,
  ListWrapper,
  LoadingSpinner,
  RoleCell,
  StatusCell,
  UserCard,
  UserEmail,
  UserInfoCell,
  UserName,
} from './InvitedUserslist.styles';
import { WorkspaceListItem } from '@/lib/workspaces/workspaces.types';
import { User } from '@/lib/users/users.types';
import { getRoleLabel } from '@/lib/roles/roles';

type InvitedUserslistProps = {
  users: User[] | null;
  setUsers: (users: User[]) => void;
  loggedInUser: User;
  workspace: WorkspaceListItem;
  canManage: boolean;
};

const InvitedUserslist: FC<InvitedUserslistProps> = ({
  loggedInUser,
  users,
  setUsers,
  workspace,
  canManage,
}) => {

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<string | null>(null);

  const { addStatus } = useStatus();

  /* ---------- Workspace Scope ---------- */
  const workspaceUserIds = useMemo(
    () => new Set((workspace.access || []).map((a) => a.userId)),
    [workspace]
  );

  const scopedUsers = useMemo(
    () => (users || []).filter((u) => workspaceUserIds.has(u._id)),
    [users, workspaceUserIds]
  );

  /* ---------- API ---------- */

  const revokeAccess = async (userId: string) => {
    const prev = [...(users || [])];
    // Optimistic: remove user immediately
    setUsers(prev.filter((u) => u._id !== userId));
    try {
      const response = await fetch(
        `/api/workspaces/${workspace._id}/users/${userId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const data = await response.json();
        setUsers(prev);
        addStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setUsers(prev);
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
    }
  };

  /* ---------- Modal ---------- */

  const openRevokeModal = (userId: string) => {
    setUserToRevoke(userId);
    setIsRevokeModalOpen(true);
  };

  const closeRevokeModal = () => {
    setUserToRevoke(null);
    setIsRevokeModalOpen(false);
  };

  const confirmRevoke = () => {
    if (userToRevoke) revokeAccess(userToRevoke);
    closeRevokeModal();
  };

  /* ---------- Render ---------- */

  return (
    <>
      <ListWrapper>
        {/* Logged in user */}
        <UserCard $highlight>
          <UserInfoCell>
            {loggedInUser.name && <UserName>{loggedInUser.name}</UserName>}
            <UserEmail>⭐ {loggedInUser.email}</UserEmail>
          </UserInfoCell>
          <RoleCell>
            {(() => {
              const myRole = workspace.access
                ?.find((a) => String(a.userId) === loggedInUser._id)
                ?.role;
              return getRoleLabel(myRole || '', 'de').toUpperCase();
            })()}
          </RoleCell>
          <StatusCell>Aktiv</StatusCell>
          <ActionsCell />
        </UserCard>

        {/* Workspace members */}
        {scopedUsers
          .filter((u) => u._id !== loggedInUser._id)
          .map((user) => {
            const userId = user._id;

            const role =
              workspace.access?.find((a) => String(a.userId) === userId)
                ?.role ?? '?';

            return (
              <UserCard key={userId}>
                <UserInfoCell>
                  {user.name && <UserName>{user.name}</UserName>}
                  <UserEmail>{user.email}</UserEmail>
                </UserInfoCell>
                <RoleCell>{getRoleLabel(role, 'de').toUpperCase()}</RoleCell>
                <StatusCell>Aktiv</StatusCell>
                <ActionsCell>
                  {canManage && (
                    <ActionButton
                      aria-label="Nutzer entfernen"
                      $bg="#fee2e2"
                      $color="#b91c1c"
                      onClick={() => openRevokeModal(userId)}
                      title="Nutzer entfernen"
                    >
                      <MdPersonRemove size={20} />
                    </ActionButton>
                  )}
                </ActionsCell>
              </UserCard>
            );
          })}

        {scopedUsers.length <= 1 && (
          <EmptyState>Keine weiteren Mitglieder</EmptyState>
        )}
      </ListWrapper>

      <ConfirmDeleteModal
        isOpen={isRevokeModalOpen}
        onConfirm={confirmRevoke}
        onCancel={closeRevokeModal}
      />
    </>
  );
};

export default InvitedUserslist;

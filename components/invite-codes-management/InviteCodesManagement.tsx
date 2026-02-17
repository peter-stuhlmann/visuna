'use client';

import { FC, useState, useEffect, FormEvent } from 'react';
import { InviteUsersManagementProps } from './InviteUsersManagement.types';
import InvitedUserslist from './InvitedUserslist';
import InvitationsList from './InvitationsList';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { Button, Heading } from '../content-elements/default';
import TextInput from '../content-elements/default/inputs/text-input';
import { useStatus } from '../status/StatusContext';
import RoleSelector from './RoleSelector';
import { User } from '@/lib/users/users.types';
import { getRoleLabel } from '@/lib/roles/roles';
import type { InvitationDB } from '@/lib/invitations/invitations.types';
import InvitationSkeleton from './InvitationSkeleton';

const InviteUsersManagement: FC<InviteUsersManagementProps & { userRole?: string }> = ({
  users: initialUsers,
  loggedInUser,
  userRole,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [roleOption, setRoleOption] = useState<string>('editor');
  const [users, setUsers] = useState<User[]>(initialUsers ?? []);
  const [invitations, setInvitations] = useState<InvitationDB[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const { addStatus } = useStatus();
  const { selectedWorkspace, refreshWorkspace } = useSelectedWorkspace();

  const canManage = userRole === 'superadmin' || userRole === 'admin';

  // Fetch invitations on mount
  useEffect(() => {
    if (selectedWorkspace?._id) {
      setLoadingInvitations(true);
      fetch(`/api/invitations?workspaceId=${selectedWorkspace._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.invitations) setInvitations(data.invitations);
        })
        .catch(console.error)
        .finally(() => setLoadingInvitations(false));
    }
  }, [selectedWorkspace?._id]);

  // Hydration-safe refresh
  useEffect(() => {
    if (shouldRefresh) {
      refreshWorkspace();
      setShouldRefresh(false);
    }
  }, [shouldRefresh, refreshWorkspace]);

  // Sync users from prop
  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role: roleOption,
          workspaceId: selectedWorkspace?._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.updatedUsers) setUsers(data.updatedUsers);
        if (data.invitations) setInvitations(data.invitations);

        addStatus({
          type: 'success',
          message: data.message,
        });

        setShouldRefresh(true);
        setEmail('');
        setRoleOption('editor');
      } else {
        addStatus({
          type: 'error',
          message: data.message,
        });
      }
    } catch (error: unknown) {
      addStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unbekannter Fehler ist aufgetreten.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Active users list (always visible) */}
      <Heading element="h2" value="Aktive Benutzer:innen" />
      <InvitedUserslist
        users={users}
        setUsers={setUsers}
        loggedInUser={loggedInUser}
        workspace={selectedWorkspace!}
        canManage={canManage}
      />

      {/* 2. Pending invitations (admins only) */}
      {canManage && (
        <>
          <Heading element="h2" value="Ausstehende Einladungen" />
          {loadingInvitations ? (
            <InvitationSkeleton count={2} />
          ) : (
            <InvitationsList
              invitations={invitations}
              onUpdate={setInvitations}
              type="pending"
            />
          )}
        </>
      )}

      {/* 3. Declined invitations (admins only) */}
      {canManage && (
        <>
          <Heading element="h2" value="Abgelehnte Einladungen" />
          {loadingInvitations ? (
            <InvitationSkeleton count={1} />
          ) : (
            <InvitationsList
              invitations={invitations}
              onUpdate={setInvitations}
              type="declined"
            />
          )}
        </>
      )}

      {/* 4. Revoked invitations (admins only) */}
      {canManage && (
        <>
          <Heading element="h2" value="Zurückgezogene Einladungen" />
          {loadingInvitations ? (
            <InvitationSkeleton count={1} />
          ) : (
            <InvitationsList
              invitations={invitations}
              onUpdate={setInvitations}
              type="revoked"
            />
          )}
        </>
      )}

      {/* 5. Invite form (admins only) */}
      {canManage && (
        <>
          <Heading element="h2" value="Neue:n Benutzer:in einladen" />
          <form onSubmit={handleSubmit} noValidate>
            <TextInput
              id="invite-email-input"
              label="E-Mail-Adresse"
              value={email}
              onChange={(value) => setEmail(value)}
              type="email"
              required
            />

            <RoleSelector
              roleOption={roleOption}
              setRoleOption={setRoleOption}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !email}
            >
              {isLoading
                ? `${getRoleLabel(roleOption)} wird eingeladen...`
                : `${getRoleLabel(roleOption)} einladen`}
            </Button>
          </form>
        </>
      )}
    </>
  );
};

export default InviteUsersManagement;

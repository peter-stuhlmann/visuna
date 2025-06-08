'use client';

import { FC, useState, useEffect, FormEvent } from 'react';
import { InviteUsersManagementProps } from './InviteUsersManagement.types';
import InvitedUserslist from './InvitedUserslist';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { Button, Heading } from '../content-elements/default';
import TextInput from '../content-elements/default/inputs/text';
import SelectionControlsInput from '../content-elements/default/inputs/selection-controls';
import { useStatus } from '../status/StatusContext';
import { User } from '@/types';

const InviteUsersManagement: FC<InviteUsersManagementProps> = ({
  users: initialUsers,
  loggedInUser,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [roleOption, setRoleOption] = useState<string>('redakteur');
  const [users, setUsers] = useState<User[]>(initialUsers ?? []);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const { addStatus } = useStatus();
  const { selectedWorkspace, refreshWorkspace } = useSelectedWorkspace();

  // ⛑️ Hydration-freundlicher Refresh über useEffect
  useEffect(() => {
    if (shouldRefresh) {
      refreshWorkspace();
      setShouldRefresh(false);
    }
  }, [shouldRefresh, refreshWorkspace]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role: roleOption,
          workspace: selectedWorkspace?._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const usersWithTempRole = data.updatedUsers.map((u: User) =>
          u.email === email ? { ...u, tempRole: roleOption } : u
        );

        setUsers(usersWithTempRole);
        addStatus({
          type: 'success',
          message: data.message,
        });

        setShouldRefresh(true); // ✅ Statt direktem refresh
        setEmail('');
        setRoleOption('redakteur');
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
      <InvitedUserslist
        users={users}
        setUsers={setUsers}
        loggedInUser={loggedInUser}
        workspace={selectedWorkspace!}
      />

      <Heading element="h2" value="Neue:n Benutzer:in anlegen" />
      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          label="E-Mail-Adresse"
          value={email}
          onChange={setEmail}
          type="email"
          required
        />

        <div style={{ display: 'flex', gap: '2rem', margin: '1rem 0' }}>
          <SelectionControlsInput
            label="Admin"
            checked={roleOption === 'admin'}
            onChange={(checked) => checked && setRoleOption('admin')}
            type="radio"
            name="role"
          />
          <SelectionControlsInput
            label="Redakteur:in"
            checked={roleOption === 'redakteur'}
            onChange={(checked) => checked && setRoleOption('redakteur')}
            type="radio"
            name="role"
          />
        </div>

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !email}
        >
          {isLoading ? 'Benutzer:in wird angelegt...' : 'Benutzer:in anlegen'}
        </Button>
      </form>
    </>
  );
};

export default InviteUsersManagement;

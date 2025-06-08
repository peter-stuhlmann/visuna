'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedWorkspace } from './WorkspaceContext';
import { Workspace } from '@/types';
import {
  Card,
  CardOverlay,
  CardWrapper,
  GradientOverlay,
  Menu,
  MenuButton,
  MenuItem,
  NameLabel,
  RoleLabel,
} from './WorkspaceCard.styles';
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog';
import { Role } from '../content-elements/default/types';
import { useStatus } from '../status/StatusContext';

const WorkspaceCard: FC<{ workspace: Workspace; role?: Role }> = ({
  workspace,
  role,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { selectedWorkspace, setSelectedWorkspace } = useSelectedWorkspace();
  const { addStatus } = useStatus();

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setMenuOpen(false);
  };

  const handleEdit = () => {
    router.push(`/workspaces/${workspace._id}?action=edit`);
    setMenuOpen(false);
  };

  const handleWorkspaceChange = (selected: Workspace) => {
    if (selectedWorkspace && selectedWorkspace._id === selected._id) return;
    setSelectedWorkspace(selected);
    addStatus({
      type: 'success',
      message: `Du hast zum Workspace "${selected.name}" gewechselt.`,
    });
  };

  return (
    <CardWrapper selected={selectedWorkspace?._id === workspace._id}>
      <div onClick={() => handleWorkspaceChange(workspace)}>
        <Card $backgroundImage={workspace.thumbnail || ''}>
          <CardOverlay>
            {role && <RoleLabel $role={role}>{role.toUpperCase()}</RoleLabel>}
            <NameLabel>{workspace.name}</NameLabel>
            <GradientOverlay />
          </CardOverlay>
        </Card>
      </div>

      <MenuButton
        variant={'contained'}
        textColor="#fff"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ⋮
      </MenuButton>
      {menuOpen && (
        <Menu>
          <MenuItem onClick={handleDelete}>Löschen</MenuItem>
          <MenuItem onClick={handleEdit}>Bearbeiten</MenuItem>
        </Menu>
      )}

      {isDeleteDialogOpen && (
        <WorkspaceDeleteDialog
          workspace={workspace}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        />
      )}
    </CardWrapper>
  );
};

export default WorkspaceCard;

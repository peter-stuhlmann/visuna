'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedWorkspace } from './WorkspaceContext';
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
  DomainLabel,
} from './WorkspaceCard.styles';
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog';
import { Role } from '../content-elements/default/types';
import Link from 'next/link';
import { visunaConfig } from '@/project.config';
import {
  Workspace,
  WorkspaceListItem,
} from '@/lib/workspaces/workspaces.types';

const WorkspaceCard: FC<{ workspace: WorkspaceListItem; role?: Role }> = ({
  workspace,
  role,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const router = useRouter();
  const { selectedWorkspace, setSelectedWorkspace, refreshWorkspace } =
    useSelectedWorkspace();

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setMenuOpen(false);
  };

  const handleEdit = () => {
    router.push(`/workspaces/${workspace._id}?action=edit`);
    setMenuOpen(false);
  };

  const handleWorkspaceChange = async (selected: WorkspaceListItem) => {
    if (selectedWorkspace && selectedWorkspace._id !== selected._id) {
      setSelectedWorkspace(selected);
      // refreshWorkspace() ist nicht zwingend nötig, da wir eh navigieren
    }
    router.push(`/workspaces/${selected._id}/dashboard`);
  };

  return (
    <CardWrapper $selected={selectedWorkspace?._id === workspace._id}>
      <div onClick={() => handleWorkspaceChange(workspace)}>
        <Card $backgroundImage={workspace.thumbnail || ''}>
          <CardOverlay>
            {role && <RoleLabel $role={role}>{role.toUpperCase()}</RoleLabel>}
            <NameLabel>{workspace.name}</NameLabel>
            <DomainLabel>{workspace.domain}</DomainLabel>
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
          <MenuItem>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`/${visunaConfig.projectsSlug}/${workspace._id}/de/`}
            >
              Zur Website
            </Link>
          </MenuItem>
          <MenuItem onClick={handleEdit}>Bearbeiten</MenuItem>
          <MenuItem onClick={handleDelete}>Löschen</MenuItem>
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

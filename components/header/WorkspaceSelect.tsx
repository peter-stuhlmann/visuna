'use client';

import { FC } from 'react';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { usePathname } from 'next/navigation';
import { DropdownMenu } from '../content-elements/default';
import { Workspace } from '@/lib/workspaces/workspaces.types';

type WorkspaceSelectProps = {
  workspaces: Workspace[];
};

const WorkspaceSelect: FC<WorkspaceSelectProps> = ({ workspaces }) => {
  const { selectedWorkspace, setSelectedWorkspace } = useSelectedWorkspace();
  const pathname = usePathname();

  const handleChange = (id: string) => {
    if (id === selectedWorkspace?._id) return;

    const newWorkspace = workspaces.find((w) => w._id === id);
    if (newWorkspace) {
      setSelectedWorkspace({
        ...newWorkspace,
        thumbnail: newWorkspace.thumbnail || '',
      });
    }
  };

  return selectedWorkspace ? (
    <DropdownMenu
      button={{
        children: selectedWorkspace.name,
        icon: { name: 'MdWorkspacesOutline' },
        showOnlyIconOnMobile: true,
      }}
      menuItems={workspaces.map((workspace) => ({
        children: workspace.name,
        value: workspace._id,
        onClick: () => handleChange(workspace._id.toString()),
        href: pathname.replace(
          /\/workspaces\/[^/]+/,
          `/workspaces/${workspace._id}`
        ),
        align: 'left',
      }))}
    />
  ) : null;
};

export default WorkspaceSelect;

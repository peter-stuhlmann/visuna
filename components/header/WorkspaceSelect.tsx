'use client';

import { FC } from 'react';
import { Workspace } from '@/types';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { usePathname } from 'next/navigation';
import { DropdownMenu } from '../content-elements/default';
import { useStatus } from '../status/StatusContext';

type WorkspaceSelectProps = {
  workspaces: Workspace[];
};

const WorkspaceSelect: FC<WorkspaceSelectProps> = ({ workspaces }) => {
  const { selectedWorkspace, setSelectedWorkspace } = useSelectedWorkspace();
  const { addStatus } = useStatus();
  const pathname = usePathname();

  const handleChange = (id: string) => {
    if (id === selectedWorkspace?._id) return;

    const newWorkspace = workspaces.find((w) => w._id === id);
    if (newWorkspace) {
      setSelectedWorkspace(newWorkspace);
      addStatus({
        type: 'success',
        message: `Du hast zum Workspace "${newWorkspace.name}" gewechselt.`,
      });
    }
  };

  return selectedWorkspace ? (
    <DropdownMenu
      button={{
        children: selectedWorkspace.name,
        icon: 'MdWorkspacesOutline',
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

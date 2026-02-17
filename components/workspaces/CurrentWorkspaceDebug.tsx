'use client';

import { useSelectedWorkspace } from './WorkspaceContext';

export default function CurrentWorkspaceDebug() {
  const { selectedWorkspace } = useSelectedWorkspace();

  if (!selectedWorkspace) return null;

  return (
    <div>
      Workspace: {selectedWorkspace.name}<br />
      ID: {selectedWorkspace._id}
    </div>
  );
}

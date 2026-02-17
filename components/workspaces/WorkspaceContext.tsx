'use client';

import { WorkspaceListItem } from '@/lib/workspaces/workspaces.types';
import {
  createContext,
  useContext,
  useState,
  FC,
  ReactNode,
  useCallback,
} from 'react';

type SelectedWorkspaceType = {
  selectedWorkspace: WorkspaceListItem | null;
  setSelectedWorkspace: (workspace: WorkspaceListItem | null) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  /** Current user's role in the selected workspace */
  userRole: string;
};

const SelectedWorkspaceContext = createContext<
  SelectedWorkspaceType | undefined
>(undefined);

export const useSelectedWorkspace = (): SelectedWorkspaceType => {
  const context = useContext(SelectedWorkspaceContext);
  if (!context) {
    throw new Error(
      'useSelectedWorkspace must be used within a SelectedWorkspaceProvider'
    );
  }
  return context;
};

type SelectedWorkspaceProviderProps = {
  children: ReactNode;
  initialWorkspace: WorkspaceListItem | null;
  initialUserRole?: string;
};

export const SelectedWorkspaceProvider: FC<SelectedWorkspaceProviderProps> = ({
  children,
  initialWorkspace,
  initialUserRole = 'none',
}) => {
  const [selectedWorkspace, setSelectedWorkspaceState] =
    useState<WorkspaceListItem | null>(initialWorkspace);
  const [userRole, setUserRole] = useState<string>(initialUserRole);

  // Persistiert Auswahl im User
  const setSelectedWorkspace = useCallback(
    async (workspace: WorkspaceListItem | null) => {
      setSelectedWorkspaceState(workspace);

      if (!workspace?._id) return;

      await fetch('/api/users/current-workspace', {
        method: 'PATCH',
        keepalive: true, // Background request survives navigation
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace._id }),
      });
    },
    []
  );

  // Holt Workspace neu vom Server (weiterhin nur ListItem!)
  const refreshWorkspace = useCallback(async () => {
    if (!selectedWorkspace?._id) return;

    const res = await fetch(`/api/workspaces/${selectedWorkspace._id}`);

    if (!res.ok) return;

    const ws: WorkspaceListItem = await res.json();
    setSelectedWorkspaceState(ws);
  }, [selectedWorkspace]);

  return (
    <SelectedWorkspaceContext.Provider
      value={{
        selectedWorkspace,
        setSelectedWorkspace,
        refreshWorkspace,
        userRole,
      }}
    >
      {children}
    </SelectedWorkspaceContext.Provider>
  );
};

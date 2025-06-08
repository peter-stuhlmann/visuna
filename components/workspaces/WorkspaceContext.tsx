'use client';

import { Workspace } from '@/types';
import {
  createContext,
  useContext,
  useState,
  FC,
  ReactNode,
  useEffect,
} from 'react';

type SelectedWorkspaceType = {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (selectedWorkspace: Workspace | null) => void;
  refreshWorkspace: () => Promise<void>;
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
  currentWorkspace: Workspace | null;
  fallbackWorkspaces?: Workspace[];
};

export const SelectedWorkspaceProvider: FC<SelectedWorkspaceProviderProps> = ({
  children,
  currentWorkspace,
  fallbackWorkspaces = [],
}) => {
  const [selectedWorkspace, setSelectedWorkspaceState] =
    useState<Workspace | null>(currentWorkspace || null);

  useEffect(() => {
    if (!selectedWorkspace && fallbackWorkspaces.length > 0) {
      setSelectedWorkspace(fallbackWorkspaces[0]);
    }
  }, [selectedWorkspace, fallbackWorkspaces]);

  const setSelectedWorkspace = async (workspace: Workspace | null) => {
    setSelectedWorkspaceState(workspace);

    try {
      const response = await fetch('/api/select-workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspace }),
      });

      if (!response.ok) {
        console.error(
          'Fehler beim Senden des Workspaces:',
          response.statusText
        );
      }
    } catch (error) {
      console.error(
        'Fehler beim Aktualisieren des ausgewählten Workspaces:',
        error
      );
    }
  };

  const refreshWorkspace = async () => {
    if (!selectedWorkspace?._id) return;
    const res = await fetch(`/api/workspace/${selectedWorkspace._id}`);
    if (res.ok) {
      const ws: Workspace = await res.json();
      setSelectedWorkspaceState(ws);
    } else {
      console.error('Failed to re-fetch workspace', res.status);
    }
  };

  return (
    <SelectedWorkspaceContext.Provider
      value={{ selectedWorkspace, setSelectedWorkspace, refreshWorkspace }}
    >
      {children}
    </SelectedWorkspaceContext.Provider>
  );
};

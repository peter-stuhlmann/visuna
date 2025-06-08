'use client';

import { createContext, useContext, useState, FC, ReactNode } from 'react';

export type Status = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

type StatusContextType = {
  statuses: Status[];
  addStatus: (status: Omit<Status, 'id'>) => void;
  removeStatus: (id: string) => void;
};

const DURATION = 6000; // Dauer in Millisekunden, nach der der Status automatisch entfernt wird

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const useStatus = (): StatusContextType => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};

export const StatusProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);

  const addStatus = (status: Omit<Status, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newStatus: Status = { id, ...status };
    setStatuses((prev) => [...prev, newStatus]);

    setTimeout(() => {
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    }, DURATION);
  };

  const removeStatus = (id: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  };

  const value: StatusContextType = {
    statuses,
    addStatus,
    removeStatus,
  };

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
};

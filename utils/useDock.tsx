'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
} from 'react';

type DockContextType = {
  isFixed: boolean;
  setIsFixed: (isFixed: boolean) => void;
};

const LOCAL_STORAGE_KEY = 'dock-is-fixed';

const DockContext = createContext<DockContextType | undefined>(undefined);

export const useDock = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
};

export const DockProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [isFixed, setIsFixed] = useState<boolean>(true);

  // Lade initialen Zustand aus localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      setIsFixed(saved === 'true');
    }
  }, []);

  // Speichere Änderungen in localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, isFixed.toString());
  }, [isFixed]);

  const value: DockContextType = {
    isFixed,
    setIsFixed,
  };

  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
};

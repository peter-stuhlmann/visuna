'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
} from 'react';
import { setClientCookie, getClientCookie } from '@/components/content-elements/default/utils/cookies';

type DockContextType = {
  isFixed: boolean;
  setIsFixed: (isFixed: boolean) => void;
};

const COOKIE_KEY = 'dock-is-fixed';

const DockContext = createContext<DockContextType | undefined>(undefined);

export const useDock = () => {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
};

type DockProviderProps = {
  children?: ReactNode;
  initialIsFixed?: boolean;
};

export const DockProvider: FC<DockProviderProps> = ({ 
  children, 
  initialIsFixed = true 
}) => {
  const [isFixed, setIsFixedState] = useState<boolean>(initialIsFixed);

  // Fallback: Load from client-side cookie if not provided by server
  useEffect(() => {
    if (initialIsFixed === undefined) {
      const saved = getClientCookie(COOKIE_KEY);
      if (saved !== null) {
        setIsFixedState(saved === 'true');
      }
    }
  }, [initialIsFixed]);

  const setIsFixed = (value: boolean) => {
    setIsFixedState(value);
    setClientCookie(COOKIE_KEY, value.toString());
  };

  const value: DockContextType = {
    isFixed,
    setIsFixed,
  };

  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
};

'use client';

import { createContext, useContext, useState, FC, ReactNode } from 'react';

type NavbarContextType = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isAnimateIn: boolean;
  setIsAnimateIn: (isAnimateIn: boolean) => void;
  isAnimateOut: boolean;
  setIsAnimateOut: (isAnimateOut: boolean) => void;
};

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export const NavbarProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isAnimateIn, setIsAnimateIn] = useState<boolean>(true);
  const [isAnimateOut, setIsAnimateOut] = useState<boolean>(false);

  const value: NavbarContextType = {
    isCollapsed,
    setIsCollapsed: (isCollapsed: boolean) => setIsCollapsed(isCollapsed),
    isAnimateIn,
    setIsAnimateIn: (isAnimateIn: boolean) => setIsAnimateIn(isAnimateIn),
    isAnimateOut,
    setIsAnimateOut: (isAnimateOut: boolean) => setIsAnimateOut(isAnimateOut),
  };

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
};

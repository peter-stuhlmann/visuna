'use client';

import type { Page } from '@/lib/workspaces/pages/pages.types';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useMemo,
  useEffect,
} from 'react';

type PageContextType = {
  page: Page | null;
  setPage: (page: Page) => void;
};

export const PageContext = createContext<PageContextType | undefined>(undefined);

type PageProviderProps = {
  children: ReactNode;
  initialPage?: Page | null;
};

export const PageProvider: FC<PageProviderProps> = ({
  children,
  initialPage = null,
}) => {
  const [page, setPage] = useState<Page | null>(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const value = useMemo(() => ({ page, setPage }), [page]);

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePage = (): PageContextType => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};

'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useMemo,
} from 'react';
import { Page } from './pages/Pages.types';

type PageContextType = {
  page: Page | null;
  setPage: (page: Page) => void;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

type PageProviderProps = {
  children: ReactNode;
  initialPage?: Page | null;
};

export const PageProvider: FC<PageProviderProps> = ({
  children,
  initialPage = null,
}) => {
  const [page, setPage] = useState<Page | null>(initialPage);

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

'use client';

import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useMemo,
} from 'react';

type PageElementContextType = {
  pageElement: PageElement | null;
  setPageElement: (element: PageElement | null) => void;
};

const PageElementContext = createContext<PageElementContextType | undefined>(
  undefined
);

type PageElementProviderProps = {
  children: ReactNode;
  initialElement: PageElement | null;
};

export const PageElementProvider: FC<PageElementProviderProps> = ({
  children,
  initialElement,
}) => {
  // if (!initialElement) {
  //   throw new Error('PageElementProvider requires an initialElement prop');
  // }

  const [pageElement, setPageElement] = useState<PageElement | null>(
    initialElement
  );

  const value = useMemo(() => ({ pageElement, setPageElement }), [pageElement]);

  return (
    <PageElementContext.Provider value={value}>
      {children}
    </PageElementContext.Provider>
  );
};

export const usePageElement = (): PageElementContextType => {
  const context = useContext(PageElementContext);
  if (!context) {
    throw new Error('usePageElement must be used within a PageElementProvider');
  }
  return context;
};

'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useMemo,
} from 'react';
import { PageElement } from '@/components/content-elements/default/types';

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
  console.log('PageElementProvider initialElement:', initialElement);

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

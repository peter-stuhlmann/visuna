// components/lighthouse/AnalyseSplitLayout.tsx
'use client';

import { FC, ReactNode } from 'react';
import ResizableSplit from '@/components/ResizableSplit';
import PreviewContainer from '@/components/PreviewContainer';
import { ExternalPreviewProvider } from '@/components/ExternalPreviewContext';
import { usePageElements } from '@/components/usePageElements';
import type { LanguageCode } from '@/components/language-settings/languages';

type AnalyseSplitLayoutProps = {
  availableLanguages: LanguageCode[];
  children: ReactNode;
};

const AnalyseSplitLayout: FC<AnalyseSplitLayoutProps> = ({
  availableLanguages,
  children,
}) => {
  const { pageElements } = usePageElements();

  return (
    <ResizableSplit
      direction="horizontal"
      availableLanguages={availableLanguages}
      storageKey="resizable-split-analyse"
      area1Content={
        <div style={{ paddingBottom: '40px' }}>
          {children}
        </div>
      }
      renderArea2={() => (
        <ExternalPreviewProvider value={{ isExternal: true }}>
          <PreviewContainer
            pageElements={pageElements}
            availableLanguages={availableLanguages}
            isPagePreview
          />
        </ExternalPreviewProvider>
      )}
    />
  );
};

export default AnalyseSplitLayout;

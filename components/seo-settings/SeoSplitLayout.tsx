// components/seo-settings/SeoSplitLayout.tsx
'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ResizableSplit from '@/components/ResizableSplit';
import PreviewContainer from '@/components/PreviewContainer';
import { ExternalPreviewProvider } from '@/components/ExternalPreviewContext';
import { usePageElements } from '@/components/usePageElements';
import { usePage } from '@/components/PageContext';
import type { LanguageCode } from '@/components/language-settings/languages';

type SeoSplitLayoutProps = {
  availableLanguages: LanguageCode[];
  children: ReactNode;
};

const SeoSplitLayout: FC<SeoSplitLayoutProps> = ({
  availableLanguages,
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { page } = usePage();
  const { pageElements } = usePageElements();

  // Basis-Pfad für Seitenelemente (SEO-Pfad → Seitenelemente-Pfad)
  const seitenelementePath = pathname.replace(/\/seo\/?$/, '/seitenelemente');

  // Lausche auf BroadcastChannel-Nachrichten von der „externen" Preview
  // und leite zu /seitenelemente weiter
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');

    channel.onmessage = (event) => {
      const { type } = event.data || {};

      if (type === 'edit-element') {
        const { editId } = event.data;
        if (editId) {
          router.push(`${seitenelementePath}?mode=edit-element&editId=${editId}`);
        }
      }

      if (type === 'create-element') {
        const { afterId } = event.data;
        const params = new URLSearchParams({ mode: 'create-element' });
        if (afterId) params.set('afterId', afterId);
        router.push(`${seitenelementePath}?${params.toString()}`);
      }
    };

    return () => channel.close();
  }, [router, seitenelementePath]);

  return (
    <ResizableSplit
      direction="horizontal"
      availableLanguages={availableLanguages}
      storageKey="resizable-split-seo"
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

export default SeoSplitLayout;

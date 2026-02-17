// components/pages/page-elements/hooks/usePageElementsFromPage.ts
'use client';

import { useEffect } from 'react';
import { usePageElements } from '@/components/usePageElements';
import { Page } from '@/lib/workspaces/pages/pages.types';

export function usePageElementsFromPage(page: Page, pageIdRaw: string) {
  const { setPageElements } = usePageElements();

  useEffect(() => {
    if (page.pageElements?.length > 0) {
      const normalized = page.pageElements.map((el, idx) => ({
        ...el,
        _id: el._id?.toString?.() ?? String(el._id),
        order: el.order ?? idx + 1,
      }));
      setPageElements(normalized);
    } else {
      setPageElements([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdRaw]);

  return null;
}

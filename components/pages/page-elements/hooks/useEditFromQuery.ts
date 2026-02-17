// components/pages/page-elements/hooks/useEditFromQuery.ts
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

export function useEditFromQuery(params: {
  pageElements: PageElement[];
  openEditFor: (el: PageElement) => void;
}) {
  const { pageElements, openEditFor } = params;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get('editId');
    if (!editId) return;
    if (!pageElements || pageElements.length === 0) return;

    const el = pageElements.find((e) => String(e._id) === String(editId));
    if (!el) return;

    openEditFor(el);

    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('editId');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [openEditFor, pageElements, pathname, router, searchParams]);
}

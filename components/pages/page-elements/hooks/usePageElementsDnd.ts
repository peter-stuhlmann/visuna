// components/pages/page-elements/hooks/usePageElementsDnd.ts
'use client';

import { useCallback, useMemo } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { useStatus } from '@/components/status/StatusContext';
import { usePageElements } from '@/components/usePageElements';

export function usePageElementsDnd(params: {
  workspaceId: string;
  pageId: string;
}) {
  const { workspaceId, pageId } = params;

  const { addStatus } = useStatus();
  const { pageElements, setPageElements } = usePageElements();

  const sortableItems = useMemo(
    () => pageElements.map((el) => String(el._id)),
    [pageElements]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = pageElements.findIndex(
        (el) => String(el._id) === String(active.id)
      );
      const newIndex = pageElements.findIndex(
        (el) => String(el._id) === String(over.id)
      );
      if (oldIndex < 0 || newIndex < 0) return;

      const prev = pageElements;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);

      const reOrdered = next.map((el, idx) => ({ ...el, order: idx + 1 }));
      setPageElements(reOrdered);

      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/pages/${pageId}/page-elements/order`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: reOrdered.map((el) => ({
                id: String(el._id),
                order: el.order ?? 0,
              })),
            }),
          }
        );

        if (!res.ok) {
          const msg =
            (await res.json().catch(() => ({})))?.message ||
            'Order konnte nicht gespeichert werden.';
          setPageElements(prev);
          addStatus({ type: 'error', message: msg });
          return;
        }

        addStatus({ type: 'success', message: 'Reihenfolge aktualisiert.' });
      } catch (e) {
        console.error('[update-order] Error:', e);
        setPageElements(prev);
        addStatus({
          type: 'error',
          message: 'Order konnte nicht gespeichert werden.',
        });
      }
    },
    [addStatus, pageElements, pageId, setPageElements, workspaceId]
  );

  return { sortableItems, onDragEnd };
}

// components/pages/page-elements/hooks/useDeletePageElement.ts
'use client';

import { useCallback } from 'react';
import { useStatus } from '@/components/status/StatusContext';
import { usePageElements } from '@/components/usePageElements';
import { useElementApi } from '@/components/ElementApiContext';

export function useDeletePageElement(params: {
  workspaceId: string;
  pageId: string;
  editingPageElementId: string | null;
  closeModal: () => void;
}) {
  const { workspaceId, pageId, editingPageElementId, closeModal } = params;

  const { addStatus } = useStatus();
  const { pageElements, setPageElements, removePageElement } = usePageElements();
  const api = useElementApi(workspaceId, pageId);

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = pageElements;
      const filtered = prev.filter((el) => String(el._id) !== String(id));
      const reOrdered = filtered.map((el, idx) => ({ ...el, order: idx + 1 }));

      // Optimistic update using context method (ensures sync)
      removePageElement(id);

      if (editingPageElementId && String(editingPageElementId) === String(id)) {
        closeModal();
      }

      try {
        const res = await fetch(
          api.elementPath(id),
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspaceId,
              pageElementId: id,
              pageId,
            }),
          }
        );

        if (!res.ok) {
          const msg =
            (await res.json().catch(() => ({})))?.message ||
            'Löschen fehlgeschlagen.';
          setPageElements(prev);
          addStatus({ type: 'error', message: msg });
          return;
        }

        // optional: Order nachziehen
        if (reOrdered.length > 0) {
          await fetch(
            api.orderPath,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workspaceId,
                pageId,
                items: reOrdered.map((el) => ({
                  id: String(el._id),
                  order: el.order ?? 0,
                })),
              }),
            }
          );
        }

        addStatus({
          type: 'success',
          message: 'Element erfolgreich gelöscht.',
        });
      } catch (err) {
        console.error('[delete-element] Error:', err);
        setPageElements(prev);
        addStatus({ type: 'error', message: 'Löschen fehlgeschlagen.' });
      }
    },
    [
      addStatus,
      closeModal,
      editingPageElementId,
      pageElements,
      pageId,
      setPageElements,
      workspaceId,
      api,
    ]
  );

  return { handleDelete };
}

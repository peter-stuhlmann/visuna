
import { useCallback } from 'react';
import { useStatus } from '@/components/status/StatusContext';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import { useElementApi } from '@/components/ElementApiContext';

export function usePersistPageElementsOrder(workspaceId: string, pageId: string) {
  const { addStatus } = useStatus();
  const api = useElementApi(workspaceId, pageId);

  const persistOrder = useCallback(
    async (items: PageElement[]) => {
      try {
        const payload = items.map((el, index) => ({
          id: String(el._id),
          order: index + 1,
        }));

        const res = await fetch(
            api.orderPath,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workspaceId,
                pageId,
                items: payload,
              }),
            }
          );

        if (!res.ok) {
           const json = await res.json().catch(() => ({}));
           // Only show error status, success is silent usually for auto-save/drag
           addStatus({
            type: 'error',
            message:
              json?.message ?? 'Reihenfolge konnte nicht gespeichert werden.',
          });
          return false;
        }
        return true;
      } catch {
        addStatus({
          type: 'error',
          message: 'Netzwerkfehler beim Speichern der Reihenfolge.',
        });
        return false;
      }
    },
    [addStatus, workspaceId, pageId, api]
  );

  return { persistOrder };
}

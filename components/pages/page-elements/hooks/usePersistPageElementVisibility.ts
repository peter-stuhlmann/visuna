import { useCallback } from 'react';
import { useStatus } from '@/components/status/StatusContext';
import { useElementApi } from '@/components/ElementApiContext';

export function usePersistPageElementVisibility(workspaceId: string, pageId?: string) {
  const { addStatus } = useStatus();
  const api = useElementApi(workspaceId, pageId ?? '');

  const persistVisibility = useCallback(
    async (pageElementId: string, _pageId: string, visible: boolean) => {
      try {
        const res = await fetch(
          api.elementPath(pageElementId),
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patch: { visible } }),
          }
        );

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          addStatus({
            type: 'error',
            message:
              json?.message ?? 'Sichtbarkeit konnte nicht gespeichert werden.',
          });
          return false;
        }
        return true;
      } catch {
        addStatus({
          type: 'error',
          message: 'Netzwerkfehler beim Speichern der Sichtbarkeit.',
        });
        return false;
      }
    },
    [addStatus, api]
  );

  return { persistVisibility };
}

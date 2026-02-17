// components/pages/page-elements/hooks/usePublishStatus.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStatus } from '@/components/status/StatusContext';
import handlePagePublishStatus from '../../pages-list/utils/update-page-publish-status';
import { Page, PageVisibility } from '@/lib/workspaces/pages/pages.types';

export function usePublishStatus(params: {
  page: Page;
  pageId: string;
  workspaceId?: string;
}) {
  const { addStatus } = useStatus();
  const { page, pageId, workspaceId: workspaceIdParam } = params;

  // ✅ EINZIGE Quelle: page.workspaceId
  const workspaceId =
    workspaceIdParam ?? String((page as any)?.workspaceId ?? '');

  const [publishedStatus, setPublishedStatus] = useState<PageVisibility>(
    (page.publishStatus as PageVisibility) ?? 'offline'
  );

  useEffect(() => {
    setPublishedStatus((page.publishStatus as PageVisibility) ?? 'offline');
  }, [pageId, page.publishStatus]);

  const togglePublish = useCallback(
    async (next: PageVisibility) => {
      const prev = publishedStatus;

      // optimistic
      setPublishedStatus(next);

      try {
        const updatedPage = await handlePagePublishStatus(
          pageId,
          workspaceId,
          next
        );

        // ✅ Server-Wahrheit zurück in State
        setPublishedStatus(
          (updatedPage.publishStatus as PageVisibility) ?? next
        );
      } catch (e) {
        setPublishedStatus(prev);
        addStatus({
          type: 'error',
          message:
            e instanceof Error
              ? e.message
              : 'Publish-Status konnte nicht gespeichert werden.',
        });
      }
    },
    [addStatus, pageId, workspaceId, publishedStatus]
  );

  return { publishedStatus, togglePublish };
}

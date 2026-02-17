// components/pages/pages-list/utils/update-page-publish-status.ts
import type { Page, PageVisibility } from '@/lib/workspaces/pages/pages.types';

const handlePagePublishStatus = async (
  pageId: string,
  workspaceId: string,
  publishStatus: PageVisibility
): Promise<Page> => {
  const pid = String(pageId || '').trim();
  if (!pid) throw new Error('pageId fehlt.');

  const wid = String(workspaceId || '').trim();
  if (!wid) throw new Error('workspaceId fehlt.');

  const response = await fetch(`/api/workspaces/${wid}/pages/${pid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId: pid,
      workspaceId: wid,
      publishStatus,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message || 'Fehler beim Ändern des Veröffentlichungsstatus.'
    );
  }

  const page = payload?.page as Page | undefined;
  if (!page) throw new Error('API hat keine page zurückgegeben.');

  // Dispatch sync event for cross-component updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('page-publish-status-change', {
      detail: { pageId: pid, workspaceId: wid, publishStatus, page }
    }));
  }

  return page;
};

export default handlePagePublishStatus;

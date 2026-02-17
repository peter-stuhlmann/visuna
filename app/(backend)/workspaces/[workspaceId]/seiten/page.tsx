import { Breadcrumbs } from '@/components/content-elements/default';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPageById } from '@/lib/workspaces/pages/pages.service';
import { getWorkspaceLanguages } from '@/utils/getWorkspaceLanguages';
import PagesSplitView from '@/components/pages/PagesSplitView'; // Client Component


export default async function PagesListPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { workspaceId } = await params;
  const sp = await searchParams;
  const selectedPageId = typeof sp.pageId === 'string' ? sp.pageId : null;

  // Layout-Persistence (Server-Side)
  const cookieStore = await cookies();
  const initSize = Number(cookieStore.get('pages-split-view-size')?.value);
  const initOrientation = cookieStore.get('pages-split-view-orientation')?.value;
  const initFlipped = cookieStore.get('pages-split-view-flipped')?.value === 'true';

  // Fetch data
  const workspaceLanguages = await getWorkspaceLanguages(workspaceId);

  let selectedPage = null;
  if (selectedPageId) {
    try {
      selectedPage = await getPageById(selectedPageId, workspaceId);
    } catch {
      redirect(`/workspaces/${workspaceId}/seiten`);
    }
  }

  return (
    <>
      {/* <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          currentLanguage: 'de',
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Seiten', en: 'Pages' },
              href: {
                de: `/workspaces/${workspaceId}/seiten`,
                en: `/workspaces/${workspaceId}/seiten`,
              },
              highlighted: true,
            },
          ],
        }}
      /> */}

      <PagesSplitView
        workspaceLanguages={workspaceLanguages}
        workspaceId={workspaceId}
        selectedPageId={selectedPageId}
        selectedPage={selectedPage}
        initialSize={!isNaN(initSize) ? initSize : undefined}
        initialOrientation={initOrientation === 'horizontal' || initOrientation === 'vertical' ? initOrientation : undefined}
        initialFlipped={initFlipped}
      />
    </>
  );
}

// app/(backend)/workspaces/[workspaceId]/seiten/[pageId]/preview/page.tsx
import { notFound } from 'next/navigation';
import { PageProvider } from '@/components/PageContext';
import { PageElementsProvider } from '@/components/usePageElements';
import { getPage } from '../utils/getPage';
import { getWorkspaceLanguages } from '@/utils/getWorkspaceLanguages';
import ExternalPreview from './ExternalPreview';

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ workspaceId: string; pageId: string }>;
}) {
  const { workspaceId, pageId } = await params;

  const page = await getPage(pageId);
  if (!page) return notFound();

  const availableLanguages = await getWorkspaceLanguages(workspaceId);

  return (
    <PageProvider initialPage={page}>
      <PageElementsProvider initialElements={page.pageElements}>
        <ExternalPreview
          availableLanguages={availableLanguages}
        />
      </PageElementsProvider>
    </PageProvider>
  );
}

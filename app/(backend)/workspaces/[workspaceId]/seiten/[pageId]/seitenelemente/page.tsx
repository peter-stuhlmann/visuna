// app/(backend)/workspaces/[id]/seiten/[pageId]/seitenelemente/page.tsx
import { notFound } from 'next/navigation';
import PageElementsList from '@/components/pages/page-elements/PageElementsList'; // StickyBar,
import ResizableSplit from '@/components/ResizableSplit';
import { PageProvider } from '@/components/PageContext';
import { PageElementsProvider } from '@/components/usePageElements';
import { getPage } from '../utils/getPage';
import connectToDatabase from '@/utils/connectToDatabase';
import {
  ALL_LANGUAGES,
  LanguageCode,
} from '@/components/language-settings/languages';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';
import { getWorkspaceLanguages } from '@/utils/getWorkspaceLanguages';



export default async function PageElementsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; pageId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { workspaceId, pageId } = await params;

  // getPage liefert Page mit pageElements: PageElement[]
  const page = await getPage(pageId);
  if (!page) return notFound();

  // Alle Sprachen des Workspaces laden
  const availableLanguages = await getWorkspaceLanguages(workspaceId);

  const { mode } = await searchParams;
  const isEditMode = mode === 'edit-element';
  const storageKey = isEditMode
    ? 'resizable-split-edit'
    : 'resizable-split-list';

  return (
    <PageProvider initialPage={page}>
      <PageElementsProvider initialElements={page.pageElements}>
        <ResizableSplit
          key={storageKey}
          direction="horizontal"
          availableLanguages={availableLanguages}
          area1Content={<PageElementsList page={page} />}
          storageKey={storageKey}
        />
      </PageElementsProvider>
    </PageProvider>
  );
}

import { notFound } from 'next/navigation';
import { Heading, Wrapper } from '@/components/content-elements/default';
import { getPage } from '../utils/getPage';
import PageElementsList from '@/components/pages/page-edit/PageElementsList';
import ResizableSplit from '@/components/ResizableSplit';
import { PageProvider } from '@/components/PageContext';
import { PageElementsProvider } from '@/components/usePageElements';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = await getPage(pageId);
  if (!page) return notFound();

  return (
    <PageProvider initialPage={page}>
      <PageElementsProvider initialElements={page.pageElements}>
        <ResizableSplit
          direction="horizontal"
          area1Content={
            <div style={{ minWidth: '500px' }}>
              <Wrapper
                data={{
                  innerWidth: 'xl',
                  paddingRight: 'm',
                  paddingLeft: 'm',
                  paddingTop: 'm',
                  paddingBottom: 'm',
                  children: (
                    <>
                      <Heading
                        element="h1"
                        value={`Seitenelemente "${page.name}"`}
                      />
                      <PageElementsList page={page} />
                    </>
                  ),
                }}
              />
            </div>
          }
          // area2Content={<PreviewContainer pageElements={page.pageElements} />} // z.B. so
        />
      </PageElementsProvider>
    </PageProvider>
  );
}

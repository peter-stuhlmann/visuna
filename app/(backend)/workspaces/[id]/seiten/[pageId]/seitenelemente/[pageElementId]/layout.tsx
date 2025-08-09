import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage } from '../../utils/getPage';
import { getPageElement } from '@/utils/getPageElement';
// import { Heading, Wrapper } from '@/components/content-elements/default';
// import ResizableSplit from '@/components/ResizableSplit';
// import ContentElementSettingsWrapper from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';
// import PreviewContainer from '@/components/PreviewContainer';
// import { PageElementProvider } from '@/components/PageElementContext';

export const metadata: Metadata = {
  title: 'Seitenelemente | VISUNA',
};

type PageElementIdLayoutProps = {
  params: Promise<{ pageId: string; pageElementId: string }>;
};

export default async function PageElementIdLayout({
  params,
}: PageElementIdLayoutProps) {
  const { pageId, pageElementId } = await params;

  const page = await getPage(pageId);
  if (!page) return notFound();

  const pageElement = await getPageElement(pageElementId);
  if (!pageElement) {
    return notFound();
  }

  return (
    // <PageElementProvider initialElement={pageElement}>
    //   <ResizableSplit
    //     direction="horizontal"
    //     area1Content={
    //       <div style={{ minWidth: '500px' }}>
    //         <Wrapper
    //           data={{
    //             innerWidth: 'full',
    //             paddingRight: 'm',
    //             paddingLeft: 'm',
    //             paddingTop: 'm',
    //             paddingBottom: 'm',
    //             children: (
    //               <>
    //                 <Heading element="h1" value="Seitenelement" />
    //                 <div style={{ fontWeight: 'bold', fontSize: '2rem' }}>
    //                   {pageElement.name}
    //                 </div>
    //                 <div>{pageElement.element}</div>
    //                 <ContentElementSettingsWrapper />
    //               </>
    //             ),
    //           }}
    //         />
    //       </div>
    //     }
    //   />
    // </PageElementProvider>
    <div>Test</div>
  );
}

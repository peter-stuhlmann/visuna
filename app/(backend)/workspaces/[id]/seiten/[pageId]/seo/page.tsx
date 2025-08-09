import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from '../utils/getPage';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = await getPage(pageId);

  if (!page) {
    return notFound();
  }

  return (
    <>
      <Breadcrumbs
        links={[
          {
            label: 'Dashboard',
            href: `/workspaces/${pageId}/dashboard`,
            isActive: false,
          },
          {
            label: 'Seiten',
            href: `/workspaces/${pageId}/seiten`,
            isActive: false,
          },
          {
            label: `Seite "${page.name}"`,
            isActive: true,
          },
        ]}
        data={{ innerWidth: 'full' }}
      />
      <Wrapper
        data={{
          innerWidth: 'full',
          children: (
            <Heading
              element="h1"
              value={`SEO Einstellungen für "${page.name}"`}
            />
          ),
        }}
      ></Wrapper>
    </>
  );
}

import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from './utils/getPage';
import CardsGrid from '@/components/content-elements/default/cards/cards-grid';
import { PageProvider } from '@/components/PageContext';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id, pageId } = await params;
  const page = await getPage(pageId);

  if (!page) {
    return notFound();
  }

  const cards = [
    {
      title: 'Seitenelemente',
      teaser: 'This is the first card.',
      href: `/workspaces/${id}/seiten/${pageId}/seitenelemente`,
    },
    {
      title: 'SEO',
      teaser: 'This is the second card.',
      href: `/workspaces/${id}/seiten/${pageId}/seo`,
    },
  ];

  return (
    <PageProvider>
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
        data={{ innerWidth: 'xl', marginTop: 'xl' }}
      />
      <Wrapper
        data={{
          innerWidth: 'xl',
          children: (
            <>
              <Heading element="h1" value={`Seite "${page.name}"`} />
              <CardsGrid cards={cards} />
            </>
          ),
        }}
      />
    </PageProvider>
  );
}

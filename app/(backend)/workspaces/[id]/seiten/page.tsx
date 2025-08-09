import PagesList from '@/components/pages/pages-list/PagesList';
import { getPages } from './utils/getPages';
import {
  Breadcrumbs,
  Heading,
  Subline,
  Wrapper,
} from '@/components/content-elements/default';

export default async function PagesListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pages = await getPages();

  return (
    <>
      <Breadcrumbs
        links={[
          {
            label: 'Dashboard',
            href: `/workspaces/${id}/dashboard`,
            isActive: false,
          },
          {
            label: 'Seiten',
            isActive: true,
          },
        ]}
        data={{
          innerWidth: 'xl',
          marginTop: 'xl',
          paddingLeft: 'm',
          paddingRight: 'm',
          paddingTop: 'm',
          paddingBottom: 'm',
        }}
      />

      <Wrapper
        data={{
          innerWidth: 'xl',
          paddingLeft: 'm',
          paddingRight: 'm',
          paddingTop: 'm',
          paddingBottom: 'm',
          children: (
            <>
              <Heading value="Seiten" element="h1" />
              <Subline value="Hier werden alle Seiten aufgelistet." />
              <PagesList pagesList={pages} />
            </>
          ),
        }}
      />
    </>
  );
}

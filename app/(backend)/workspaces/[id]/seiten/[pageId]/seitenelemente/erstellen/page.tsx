// app/.../CreatePagePage.tsx
import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from '../../utils/getPage';
import CreatePageClientWrapper from './XXX-CreatePageClientWrapper';

export default async function CreatePagePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = await getPage(pageId);

  if (!page) return notFound();

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
            label: `Seite: "${page.name}"`,
            href: `/workspaces/${pageId}/seiten/${pageId}`,
            isActive: false,
          },
          {
            label: `Seitenelemente`,
            href: `/workspaces/${pageId}/seiten/${pageId}/seitenelemente`,
            isActive: false,
          },
          {
            label: `Neues Seitenelement hinzufügen`,
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
              <Heading element="h1" value="Neues Seitenelement hinzufügen" />
              <CreatePageClientWrapper pageId={pageId} />
            </>
          ),
        }}
      />
    </>
  );
}

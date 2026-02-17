import { getForm } from './helpers/getForm';
import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import FormClientWrapper from './FormClientWrapper';

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string; slug: string }>;
}) {
  const { workspaceId, slug } = await params;

  const form = await getForm(slug);

  if (!form) return notFound();

  return (
    <>
      <Breadcrumbs
        data={{
          innerWidth: 'full',
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
              label: { de: 'Formulare', en: 'Forms' },
              href: {
                de: `/workspaces/${workspaceId}/formularverwaltung/${form._id}`,
                en: `/workspaces/${workspaceId}/formularverwaltung/${form._id}`,
              },
              highlighted: false,
            },
            {
              label: { de: `Formular: ${form.name}`, en: `Form: ${form.name}` },
              href: {
                de: `/workspaces/${workspaceId}/formularverwaltung/${form._id}`,
                en: `/workspaces/${workspaceId}/formularverwaltung/${form._id}`,
              },
              highlighted: false,
            },
          ],
        }}
      />
      <Wrapper
        data={{
          layout: {
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
            outerPaddingLeft: 'm',
            outerPaddingRight: 'm',
            outerPaddingTop: 'm',
            outerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading element="h1" value={`Formular "${form.name}"`} />
              <FormClientWrapper form={form} />
            </>
          ),
        }}
      />
    </>
  );
}

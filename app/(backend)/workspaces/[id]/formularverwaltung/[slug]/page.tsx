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
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;

  const form = await getForm(slug);

  if (!form) return notFound();

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
            label: 'Formulare',
            href: `/workspaces/${id}/formularverwaltung/${form._id}`,
            isActive: false,
          },
          {
            label: `Formular: ${form.name}`,
            href: `/workspaces/${id}/formularverwaltung/${form._id}`,
            isActive: false,
          },
        ]}
        data={{ innerWidth: 'full' }}
      />
      <Wrapper
        data={{
          innerWidth: 'full',
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

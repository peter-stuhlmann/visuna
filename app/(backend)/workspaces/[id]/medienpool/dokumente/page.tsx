import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
            label: 'Medienpool',
            href: `/workspaces/${id}/medienpool`,
            isActive: false,
          },
          {
            label: 'Dokumente',
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
              <Heading element="h1" value="Dokumente" />
            </>
          ),
        }}
      />
    </>
  );
}

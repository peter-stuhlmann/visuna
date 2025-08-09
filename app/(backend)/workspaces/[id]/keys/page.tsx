import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

export default async function KeysManagementPage({
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
            label: 'API-Schlüsselverwaltung',
            isActive: true,
          },
        ]}
        data={{ innerWidth: 'full' }}
      />
      <Wrapper
        data={{
          innerWidth: 'full',
          children: (
            <>
              <Heading element="h1" value="API-Schlüsselverwaltung" />
            </>
          ),
        }}
      />
    </>
  );
}

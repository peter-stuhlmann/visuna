import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

export default async function WorkspaceSettingsPage({
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
            label: 'Workspace-Einstellungen',
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
              <Heading element="h1" value="Workspace-Einstellungen" />
            </>
          ),
        }}
      />
    </>
  );
}

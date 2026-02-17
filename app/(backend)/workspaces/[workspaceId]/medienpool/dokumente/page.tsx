import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
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
              label: { de: 'Medienpool', en: 'Media Pool' },
              href: {
                de: `/workspaces/${workspaceId}/medienpool`,
                en: `/workspaces/${workspaceId}/medienpool`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Dokumente', en: 'Documents' },
              highlighted: true,
            },
          ],
        }}
      />
      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
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

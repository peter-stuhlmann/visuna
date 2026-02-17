import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import WorkspaceDefaultsImages from '@/components/workspace-defaults/images/Images';

type PageParams = {
  params: Promise<{ workspaceId: string }>;
};

export default async function DefaultsPage({ params }: PageParams) {
  const { workspaceId } = await params;

  return (
    <>
      <Breadcrumbs
        data={{
          outerWidth: 'full',
          innerWidth: 'xl',
          innerPaddingLeft: 'm',
          innerPaddingRight: 'm',
          innerPaddingTop: 'm',
          innerPaddingBottom: 'm',
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
              label: { de: 'Default-Einstellungen', en: 'Default settings' },
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
              <Heading
                element="h1"
                value="Default-Einstellungen für den Workspace"
              />

              {/* 🔹 Images-Block mit Fallback-Bild */}
              <WorkspaceDefaultsImages workspaceId={workspaceId} />
            </>
          ),
        }}
      />
    </>
  );
}

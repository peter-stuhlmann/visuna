import {
  Breadcrumbs,
  Heading,
  IntroText,
  Wrapper,
} from '@/components/content-elements/default';

import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { getWorkspace } from '../getWorkspace';

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const user = await getLoggedInUser();
  const workspace = await getWorkspace(workspaceId);

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
              highlighted: true,
            },
          ],
        }}
      />

      <IntroText
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'xl',
            innerPaddingBottom: 'm',
            outerBackgroundColor: '#314158',
          },
          overline: {
            value: {
              de: '<span style="color: #fff">Workspace</span>',
              en: '<span style="color: #fff">Workspace</span>',
            },
            element: 'span',
          },
          heading: {
            value: {
              de: `<span style="color: #fff">${workspace?.name || 'Unbekannter Workspace'}</span>`,
              en: `<span style="color: #fff">${workspace?.name || 'Unknown Workspace'}</span>`,
            },
            element: 'h1',
          },
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
                element="h2"
                value={`Hallo, ${user?.name || user?.email || 'Nutzer'}!`}
              />
            </>
          ),
        }}
      />
    </>
  );
}

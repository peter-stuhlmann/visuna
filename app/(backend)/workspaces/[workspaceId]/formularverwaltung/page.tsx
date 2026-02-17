import dynamic from 'next/dynamic';
import { getForms } from './helpers/getForms';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

const Forms = dynamic(() => import('@/components/create-form/Forms'));

export default async function FormsManagementPage({
  params,
}: {
  params: Promise<{ workspaceId: string; slug: string }>;
}) {
  const { workspaceId } = await params;
  const forms = await getForms();

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
              label: { de: 'Formulare', en: 'Forms' },
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
              <Heading element="h1" value="Formulare" />

              <p>Hier werden alle Formulare aufgelistet.</p>

              <Forms formsList={forms} />
            </>
          ),
        }}
      />
    </>
  );
}

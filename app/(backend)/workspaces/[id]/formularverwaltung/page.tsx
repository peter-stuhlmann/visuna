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
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  const forms = await getForms();

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

import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

import getLogs from './helpers/getLogs';
import Logs from '@/components/logs/Logs';

export default async function LogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const logs = await getLogs();

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
            label: 'Aktivitätsprotokoll (Logs)',
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
              <Heading element="h1" value="Aktivitäts&shy;protokoll (Logs)" />
              <Logs logs={logs} />
            </>
          ),
        }}
      />
    </>
  );
}

import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

import getAiLogs from './helpers/getAiLogs';
import AiLogs from '@/components/ai-logs/AiLogs';

export default async function AiLogsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const { logs, stats } = await getAiLogs(workspaceId);

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
              label: {
                de: 'AI-Protokoll (AI-Logs)',
                en: 'AI Log',
              },
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
              <Heading element="h1" value="AI-Protokoll (AI-Logs)" />
              <AiLogs logs={logs} stats={stats} />
            </>
          ),
        }}
      />
    </>
  );
}

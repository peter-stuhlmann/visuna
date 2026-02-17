// app/(backend)/workspaces/[id]/seiten/[pageId]/analyse/page.tsx
import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from '../utils/getPage';
import LighthouseDetails from '@/components/lighthouse/LighthouseDetails';
import { getLighthouseReport } from '@/utils/getLighthouseReport';
import type { Strategy } from '@/lib/workspaces/pages/analysis/analysis.types';
import { PageProvider } from '@/components/PageContext';
import { PageElementsProvider } from '@/components/usePageElements';
import { getWorkspaceContentLanguages } from '@/utils/getWorkspaceLanguages';
import { LanguageCode } from '@/components/language-settings/languages';
import AnalyseSplitLayout from '@/components/lighthouse/AnalyseSplitLayout';

type CategoryId = 'performance' | 'accessibility' | 'seo' | 'best-practices';

export default async function LighthousePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; pageId: string }>;
  searchParams?: Promise<{ category?: string; strategy?: string }>;
}) {
  const { workspaceId, pageId } = await params;
  const sp = (await searchParams) || {};

  const page = await getPage(pageId);
  if (!page) return notFound();

  const languages = await getWorkspaceContentLanguages(workspaceId);

  const siteOrigin = process.env.SITE_ORIGIN || 'http://localhost:3000';
  const rawSlug = page.slug || '';
  const pageUrl = `${siteOrigin}/p/${workspaceId}/de/${rawSlug}`;

  const categoryParam = (sp.category || '').trim() as CategoryId;
  const allowedCategories: CategoryId[] = [
    'performance',
    'accessibility',
    'seo',
    'best-practices',
  ];
  const initialCategory: CategoryId = allowedCategories.includes(categoryParam)
    ? categoryParam
    : 'performance';

  const strategyParam = (sp.strategy || '').trim() as Strategy;
  const allowedStrategies: Strategy[] = ['mobile', 'desktop'];
  const initialStrategy: Strategy = allowedStrategies.includes(strategyParam)
    ? strategyParam
    : 'mobile';

  const initialReport = await getLighthouseReport(pageId);

  return (
    <PageProvider initialPage={page}>
      <PageElementsProvider initialElements={page.pageElements}>
        <AnalyseSplitLayout availableLanguages={languages as LanguageCode[]}>
          <Breadcrumbs
            data={{
              layout: {
                outerWidth: 'full',
                innerWidth: 'xl',
                innerPaddingTop: 'm',
                innerPaddingBottom: 'm',
                innerPaddingLeft: 'm',
                innerPaddingRight: 'm',
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
                  label: { de: 'Seiten', en: 'Pages' },
                  href: {
                    de: `/workspaces/${workspaceId}/seiten`,
                    en: `/workspaces/${workspaceId}/seiten`,
                  },
                  highlighted: false,
                },
                {
                  label: { de: `Seite "${page.name}"`, en: `Page "${page.name}"` },
                  href: {
                    de: `/workspaces/${workspaceId}/seiten/${pageId}`,
                    en: `/workspaces/${workspaceId}/seiten/${pageId}`,
                  },
                  highlighted: false,
                },
                {
                  label: { de: 'Analyse', en: 'Analysis' },
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
                  <Heading element="h1" value="Analyse" />
                  <Heading element="h2" value={page.name} />

                  <LighthouseDetails
                    pageId={pageId}
                    pageUrl={pageUrl}
                    initialCategory={initialCategory}
                    initialStrategy={initialStrategy}
                    initialReport={initialReport}
                    workspaceId={workspaceId}
                  />
                </>
              ),
            }}
          />
        </AnalyseSplitLayout>
      </PageElementsProvider>
    </PageProvider>
  );
}

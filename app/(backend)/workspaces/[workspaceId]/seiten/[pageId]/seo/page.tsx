import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from '../utils/getPage';
import SeoSettingsSummary from '@/components/seo-settings/SeoSettingsSummary';
import SeoSplitLayout from '@/components/seo-settings/SeoSplitLayout';
import { PageProvider } from '@/components/PageContext';
import { PageElementsProvider } from '@/components/usePageElements';
import { getWorkspaceContentLanguages } from '@/utils/getWorkspaceLanguages';
import { LanguageCode } from '@/components/language-settings/languages';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ workspaceId: string; pageId: string }>;
}) {
  const { workspaceId, pageId } = await params;
  const page = await getPage(pageId);

  const languages = await getWorkspaceContentLanguages(workspaceId);

  if (!page) {
    return notFound();
  }

  // Slugs, für die keine SEO-Einstellungen verfügbar sein sollen
  const NO_SEO_SLUGS = ['404'];

  if (NO_SEO_SLUGS.includes(page.slug)) {
    return (
      <div style={{ padding: '24px' }}>
        <Heading
          element="h1"
          value={`SEO Einstellungen für "${page.name}"`}
        />
        <div style={{ marginTop: '1rem', color: '#666' }}>
          Diese Seite (/{page.slug}) hat keine SEO-Einstellungen.
        </div>
      </div>
    );
  }

  return (
    <PageProvider initialPage={page}>
      <PageElementsProvider initialElements={page.pageElements}>
        <SeoSplitLayout availableLanguages={languages as LanguageCode[]}>
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
                  label: { de: 'SEO', en: 'SEO' },
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
                    value={`SEO Einstellungen für "${page.name}"`}
                  />
                  <SeoSettingsSummary
                    pageId={pageId}
                    pageUrl={page.slug}
                    initialSeo={page.seo}
                    languages={languages as LanguageCode[]}
                    workspaceId={workspaceId}
                  />
                </>
              ),
            }}
          />
        </SeoSplitLayout>
      </PageElementsProvider>
    </PageProvider>
  );
}

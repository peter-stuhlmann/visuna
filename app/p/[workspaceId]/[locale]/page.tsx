// app/[locale]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import getPage from './[slug]/utils/getPage';
import PageElementMapper from './utils/PageElementMapper';
import { getDefaultTemplateElements } from './utils/getDefaultTemplateElements';

import getPageSeo from './utils/getPageSeo';
import { buildMetadata } from './utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';

type Props = {
  params: Promise<{ locale: LanguageCode; workspaceId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { workspaceId, locale } = await params;

  // Home-Seite ist slug "home"
  const { pageExists, seo } = await getPageSeo(workspaceId, 'home');
  if (!pageExists) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function Page({ params }: Props) {
  const { workspaceId, locale } = await params;

  const pageData = await getPage(workspaceId, 'home');

  if (!pageData.pageExists) return notFound();

  const [headerElements, footerElements] = await Promise.all([
    getDefaultTemplateElements(workspaceId, 'header', pageData.headerTemplateId),
    getDefaultTemplateElements(workspaceId, 'footer', pageData.footerTemplateId),
  ]);

  return (
    <>
      <div>
        {headerElements.length > 0 && (
          <header>
            <PageElementMapper elements={headerElements} currentLanguage={locale} />
          </header>
        )}
        <main>
          <PageElementMapper elements={pageData.pageElements} currentLanguage={locale} />
        </main>
        {footerElements.length > 0 && (
          <footer>
            <PageElementMapper elements={footerElements} currentLanguage={locale} />
          </footer>
        )}
      </div>
    </>
  );
}

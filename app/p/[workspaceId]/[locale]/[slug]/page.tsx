// app/[locale]/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import PageElementMapper from '../utils/PageElementMapper';
import getPage from './utils/getPage';
import { getDefaultTemplateElements } from '../utils/getDefaultTemplateElements';

import getPageSeo from '../utils/getPageSeo';
import { buildMetadata } from '../utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';
import { visunaConfig } from '@/project.config';

type Props = {
  params: Promise<{ workspaceId: string; locale: LanguageCode; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { workspaceId, locale, slug } = await params;

  if (slug === 'home') return {};

  const { pageExists, seo } = await getPageSeo(workspaceId, slug);
  if (!pageExists) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubPage({ params }: Props) {
  const { workspaceId, locale, slug } = await params;

  if (workspaceId === visunaConfig.workspaceId) redirect(`/${locale}/${slug}`);

  if (slug === 'home') redirect(`/p/${workspaceId}/${locale}/`);

  const pageData = await getPage(workspaceId, slug);

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

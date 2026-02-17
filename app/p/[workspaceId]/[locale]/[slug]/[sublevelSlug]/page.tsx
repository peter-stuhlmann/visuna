// app/[locale]/[slug]/[sublevelSlug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import PageElementMapper from '../../utils/PageElementMapper';
import getPage from '../utils/getPage';

import getPageSeo from '../../utils/getPageSeo';
import { buildMetadata } from '../../utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';
import { visunaConfig } from '@/project.config';

type Props = {
  params: Promise<{
    workspaceId: string;
    locale: LanguageCode;
    slug: string;
    sublevelSlug: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { workspaceId, locale, slug, sublevelSlug } = await params;

  const fullSlug = `${slug}/${sublevelSlug}`;

  const { pageExists, seo } = await getPageSeo(workspaceId, fullSlug);
  if (!pageExists) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubLevelPage({ params }: Props) {
  const { workspaceId, locale, slug, sublevelSlug } = await params;

  if (workspaceId === visunaConfig.workspaceId)
    redirect(`/${locale}/${slug}/${sublevelSlug}`);

  const { pageExists, pageElements } = await getPage(
    workspaceId,
    `${slug}/${sublevelSlug}`
  );
  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

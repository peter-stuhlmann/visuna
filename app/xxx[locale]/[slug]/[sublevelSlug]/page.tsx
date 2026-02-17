// app/[locale]/[slug]/[sublevelSlug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import getPage from '../utils/getPage';

import type { LanguageCode } from '@/components/language-settings/languages';
import PageElementMapper from '@/app/p/[workspaceId]/[locale]/utils/PageElementMapper';
import { visunaConfig } from '@/project.config';
import { buildMetadata } from '@/app/p/[workspaceId]/[locale]/utils/buildMetadata';
import getPageSeo from '@/app/p/[workspaceId]/[locale]/utils/getPageSeo';

type Props = {
  params: Promise<{ locale: LanguageCode; slug: string; sublevelSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug, sublevelSlug } = await params;

  const fullSlug = `${slug}/${sublevelSlug}`;

  const { pageExists, seo } = await getPageSeo(
    visunaConfig.workspaceId,
    fullSlug
  );
  if (!pageExists) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubLevelPage({ params }: Props) {
  const { locale, slug, sublevelSlug } = await params;

  const { pageExists, pageElements } = await getPage(
    visunaConfig.workspaceId,
    `${slug}/${sublevelSlug}`
  );
  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

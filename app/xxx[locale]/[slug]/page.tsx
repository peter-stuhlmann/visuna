// app/[locale]/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import getPage from './utils/getPage';

import type { LanguageCode } from '@/components/language-settings/languages';
import PageElementMapper from '@/app/p/[workspaceId]/[locale]/utils/PageElementMapper';
import getPageSeo from '@/app/p/[workspaceId]/[locale]/utils/getPageSeo';
import { buildMetadata } from '@/app/p/[workspaceId]/[locale]/utils/buildMetadata';
import { visunaConfig } from '@/project.config';

type Props = {
  params: Promise<{ locale: LanguageCode; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;

  if (slug === 'home') return {};

  const { pageExists, seo } = await getPageSeo(visunaConfig.workspaceId, slug);
  if (!pageExists) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubPage({ params }: Props) {
  const { locale, slug } = await params;

  console.log('-------------- END --------------');
  if (slug === 'home') redirect(`/p/${visunaConfig.workspaceId}/${locale}/`);

  const { pageExists, pageElements } = await getPage(
    visunaConfig.workspaceId,
    slug
  );
  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

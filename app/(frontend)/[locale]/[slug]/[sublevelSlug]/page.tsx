// app/[locale]/[slug]/[sublevelSlug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import PageElementMapper from '../../utils/PageElementMapper';
import getPage from '../utils/getPage';

import getPageSeo from '../../utils/getPageSeo';
import { buildMetadata } from '../../utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';

type Props = {
  params: Promise<{
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
  const { locale, slug, sublevelSlug } = await params;

  const fullSlug = `${slug}/${sublevelSlug}`;

  const { pageExists, seo } = await getPageSeo(fullSlug);
  if (!pageExists || !seo) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubLevelPage({ params }: Props) {
  const { locale, slug, sublevelSlug } = await params;

  const fullSlug = `${slug}/${sublevelSlug}`;

  const { pageExists, pageElements } = await getPage(fullSlug);
  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

// app/[locale]/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import PageElementMapper from '../utils/PageElementMapper';
import getPage from './utils/getPage';

import getPageSeo from '../utils/getPageSeo';
import { buildMetadata } from '../utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';

type Props = {
  params: Promise<{ locale: LanguageCode; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;

  // "home" bekommt Metadata aus /[locale]/page.tsx
  if (slug === 'home') return {};

  const { pageExists, seo } = await getPageSeo(slug);
  if (!pageExists || !seo) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function SubPage({ params }: Props) {
  const { locale, slug } = await params;

  // "home" darf hier nicht gerendert werden
  if (slug === 'home') {
    notFound();
  }

  const { pageExists, pageElements } = await getPage(slug);
  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

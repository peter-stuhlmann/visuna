// app/[locale]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import getPage from './[slug]/utils/getPage';
import PageElementMapper from './utils/PageElementMapper';

import getPageSeo from './utils/getPageSeo';
import { buildMetadata } from './utils/buildMetadata';

import type { LanguageCode } from '@/components/language-settings/languages';

type Props = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;

  const { pageExists, seo, publishStatus } = await getPageSeo('home');

  // ❗ Seite existiert nicht ODER ist offline → kein SEO
  if (!pageExists || publishStatus === 'offline' || !seo) return {};

  return buildMetadata({
    seo,
    lang: locale,
    fallbackTitle: '',
    fallbackDescription: '',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  const { pageExists, publishStatus, pageElements } = await getPage('home');

  // Seite existiert nicht → 404
  if (!pageExists) {
    return notFound();
  }

  // Seite ist offline → 404
  if (publishStatus === 'offline') {
    return notFound();
  }

  // Seite ist in Wartung → 503
  if (publishStatus === 'maintenance') {
    return new Response('Service Unavailable', { status: 503 }) as never;
    // oder später: eigene Wartungsseite rendern
  }

  // live
  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

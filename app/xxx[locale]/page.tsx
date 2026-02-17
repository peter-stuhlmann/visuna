// app/[locale]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import type { LanguageCode } from '@/components/language-settings/languages';
import getPageSeo from '../p/[workspaceId]/[locale]/utils/getPageSeo';
import { buildMetadata } from '../p/[workspaceId]/[locale]/utils/buildMetadata';
import PageElementMapper from '../p/[workspaceId]/[locale]/utils/PageElementMapper';
import getPage from '../p/[workspaceId]/[locale]/[slug]/utils/getPage';

type Props = {
  params: Promise<{ locale: LanguageCode }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const workspaceId = '6946bec981433a3ffcf3b31d'; // VISUNA-Website

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;

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
  const { locale } = await params;
  const { pageExists, pageElements } = await getPage(workspaceId, 'home');

  if (!pageExists) return notFound();

  return <PageElementMapper elements={pageElements} currentLanguage={locale} />;
}

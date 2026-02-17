import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { LanguageCode } from '@/components/language-settings/languages';
import { loadWorkspaceLanguages } from '@/utils/workspaceLanguages';

type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
    workspaceId: string;
  }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { workspaceId } = await params;
  const locale = (await getLocale()) as LanguageCode;

  if (!routing.locales.includes(locale)) notFound();

  const { frontend } = await loadWorkspaceLanguages(workspaceId);
  if (!frontend.includes(locale)) notFound();

  return children;
}

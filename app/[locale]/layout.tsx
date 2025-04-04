import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Locale, routing } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Content Elements',
  description: 'Overview over all Content Elements',
};

export default async function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  return children;
}

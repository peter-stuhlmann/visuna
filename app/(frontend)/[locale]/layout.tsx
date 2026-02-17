// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import type { LanguageCode } from '@/components/language-settings/languages';
import { loadWorkspaceLanguages } from '@/utils/workspaceLanguages';
import { getRequestContext } from '@/utils/getRequestContext';

export default async function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = (await getLocale()) as LanguageCode;
  const { workspaceId } = await getRequestContext();

  // 1️⃣ Locale grundsätzlich gültig?
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // 2️⃣ Workspace vorhanden?
  if (!workspaceId) {
    notFound();
  }

  // 3️⃣ Ist die Sprache im Workspace aktiv?
  const { frontend } = await loadWorkspaceLanguages(workspaceId);

  if (!frontend.includes(locale)) {
    notFound();
  }

  return children;
}

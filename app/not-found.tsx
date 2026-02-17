// app/not-found.tsx
import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import type { LanguageCode } from '@/components/language-settings/languages';

import getPage from './p/[workspaceId]/[locale]/[slug]/utils/getPage';
import PageElementMapper from './p/[workspaceId]/[locale]/utils/PageElementMapper';

import { Heading, Wrapper } from '@/components/content-elements/default';

export default async function NotFoundPage() {
  const locale = (await getLocale()) as LanguageCode;

  const h = await headers();
  const workspaceId = h.get('x-workspace-id');

  // ❗ Ohne Workspace kein CMS → harte System-404
  if (!workspaceId) {
    return (
      <main>
        <Wrapper
          data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingTop: 'm',
              innerPaddingRight: 'm',
              innerPaddingBottom: 'm',
              innerPaddingLeft: 'm',
            },
            children: (
              <>
                <Heading value="404 – Seite nicht gefunden" element="h1" />
                <p>Die angeforderte Seite wurde nicht gefunden.</p>
              </>
            ),
          }}
        />
      </main>
    );
  }

  // 🔑 Workspace-spezifische 404-Seite aus dem CMS
  const { pageExists, pageElements } = await getPage(workspaceId, '404');

  // ❗ Falls der Workspace KEINE eigene 404 angelegt hat
  if (!pageExists) {
    return (
      <main>
        <Wrapper
          data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingTop: 'm',
              innerPaddingRight: 'm',
              innerPaddingBottom: 'm',
              innerPaddingLeft: 'm',
            },
            children: (
              <>
                <Heading value="404 – Seite nicht gefunden" element="h1" />
                <p>Die angeforderte Seite wurde nicht gefunden.</p>
              </>
            ),
          }}
        />
      </main>
    );
  }

  // ✅ CMS-gesteuerte 404
  return (
    <main>
      <PageElementMapper elements={pageElements} currentLanguage={locale} />
    </main>
  );
}

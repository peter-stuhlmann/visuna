// app/(backend)/workspaces/[id]/languages/page.tsx
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';
import LanguageSettings from '@/components/language-settings/LanguageSettings';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';

import connectToDatabase from '@/utils/connectToDatabase';

function normalizeLanguages(raw: unknown): LanguageCode[] {
  if (!Array.isArray(raw)) return [];

  const allowed = new Set(ALL_LANGUAGES.map((l) => l.code));

  return Array.from(
    new Set(
      raw
        .map((c) => String(c || '').trim() as LanguageCode)
        .filter((code) => allowed.has(code))
    )
  );
}

function resolveMainLanguage(
  raw: LanguageCode | undefined,
  content: LanguageCode[]
): LanguageCode {
  if (raw && content.includes(raw)) return raw;
  return content[0] ?? DEFAULT_LANGUAGES[0];
}

async function loadWorkspaceLanguages(workspaceId: string): Promise<{
  frontend: LanguageCode[];
  content: LanguageCode[];
  mainLanguage: LanguageCode;
}> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<WorkspaceDB>('workspaces');

  const workspace = await collection.findOne(
    { _id: workspaceId },
    { projection: { languages: 1 } }
  );

  // Content-Sprachen (primär)
  let content = normalizeLanguages(workspace?.languages?.contentLanguages);
  if (!content.length) content = [...DEFAULT_LANGUAGES];

  // Frontend-Sprachen
  let frontend = normalizeLanguages(workspace?.languages?.frontendLanguages);
  if (!frontend.length) frontend = [...content];

  // Sicherheitsnetz: Frontend ⊆ Content
  frontend = frontend.filter((c) => content.includes(c));
  if (!frontend.length) frontend = [...content];

  const mainLanguage = resolveMainLanguage(
    workspace?.languages?.mainLanguage,
    content
  );

  return { frontend, content, mainLanguage };
}

type LocalizedString = Record<string, string>;

export default async function LanguagesPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const { frontend, content, mainLanguage } =
    await loadWorkspaceLanguages(workspaceId);

  // Backend aktuell fest auf "de"
  const currentLanguage: LanguageCode = 'de';

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'none',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
          },
          currentLanguage,
          links: [
            {
              label: {
                de: 'Dashboard',
                en: 'Dashboard',
              } satisfies LocalizedString,
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              } satisfies LocalizedString,
            },
            {
              label: {
                de: 'Spracheinstellungen',
                en: 'Language settings',
              } satisfies LocalizedString,
              highlighted: true,
            },
          ],
        }}
      />

      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading element="h1" value="Spracheinstellungen" />
              <LanguageSettings
                workspaceId={workspaceId}
                initialFrontend={frontend}
                initialContent={content}
                initialMainLanguage={mainLanguage}
              />
            </>
          ),
        }}
      />
    </>
  );
}

import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';
import {
  getWorkspaceLanguages,
  saveWorkspaceLanguages,
  WorkspaceLanguagesDoc,
} from './languages.repo';
import saveLog from '@/components/logs/saveLog';

/* ---------- helpers ---------- */

function normalizeLanguages(raw: unknown): LanguageCode[] {
  if (!Array.isArray(raw)) return [];

  const allowed = new Set<LanguageCode>(ALL_LANGUAGES.map((l) => l.code));

  const filtered = raw
    .map((c) => String(c || '').trim() as LanguageCode)
    .filter((code) => allowed.has(code));

  return Array.from(new Set(filtered));
}

function resolveMainLanguage(
  rawMain: LanguageCode | undefined,
  contentLanguages: LanguageCode[]
): LanguageCode {
  if (!contentLanguages.length) {
    return DEFAULT_LANGUAGES[0];
  }

  if (rawMain && contentLanguages.includes(rawMain)) {
    return rawMain;
  }

  return contentLanguages[0];
}

/* ---------- GET FULL ---------- */

export async function getAllWorkspaceLanguages(workspaceId: string) {
  const doc: WorkspaceLanguagesDoc | null =
    await getWorkspaceLanguages(workspaceId);

  let contentLanguages = normalizeLanguages(doc?.contentLanguages);
  if (!contentLanguages.length) {
    contentLanguages = normalizeLanguages(doc?.frontendLanguages);
  }
  if (!contentLanguages.length) {
    contentLanguages = [...DEFAULT_LANGUAGES];
  }

  let frontendLanguages = normalizeLanguages(doc?.frontendLanguages);
  if (!frontendLanguages.length) {
    frontendLanguages = [...contentLanguages];
  } else {
    frontendLanguages = frontendLanguages.filter((lang) =>
      contentLanguages.includes(lang)
    );

    if (!frontendLanguages.length) {
      frontendLanguages = [...contentLanguages];
    }
  }

  const mainLanguage = resolveMainLanguage(doc?.mainLanguage, contentLanguages);

  return {
    contentLanguages,
    frontendLanguages,
    mainLanguage,
  };
}

/* ---------- GET MAIN ---------- */

export async function getMainWorkspaceLanguage(workspaceId: string) {
  const { frontendLanguages, mainLanguage } =
    await getAllWorkspaceLanguages(workspaceId);

  return {
    mainLanguage,
    frontendLanguages,
  };
}

/* ---------- SAVE ---------- */

export async function saveWorkspaceLanguagesService(
  workspaceId: string,
  body: {
    frontendLanguages?: unknown;
    contentLanguages?: unknown;
    mainLanguage?: unknown;
  }
) {
  const frontendLanguages = normalizeLanguages(body.frontendLanguages);
  const contentLanguages = normalizeLanguages(body.contentLanguages);

  if (!contentLanguages.length) {
    throw new Error('NO_CONTENT_LANGUAGES');
  }

  if (!frontendLanguages.length) {
    throw new Error('NO_FRONTEND_LANGUAGES');
  }

  const invalidFrontend = frontendLanguages.filter(
    (f) => !contentLanguages.includes(f)
  );

  if (invalidFrontend.length > 0) {
    throw new Error('FRONTEND_NOT_SUBSET_OF_CONTENT');
  }

  const mainLanguage = resolveMainLanguage(
    body.mainLanguage as LanguageCode | undefined,
    contentLanguages
  );

  await saveWorkspaceLanguages(workspaceId, {
    workspaceId,
    frontendLanguages,
    contentLanguages,
    mainLanguage,
  });

  await saveLog({
    workspaceId,
    code: '1701',
    action: 'updated',
    category: 'language',
    entityType: 'workspace',
    entityId: workspaceId,
    description: `Spracheinstellungen gespeichert (${contentLanguages.join(', ')}).`,
    details: { contentLanguages, frontendLanguages, mainLanguage },
  });

  return {
    frontendLanguages,
    contentLanguages,
    mainLanguage,
  };
}

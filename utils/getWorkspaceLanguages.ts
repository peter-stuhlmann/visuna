// utils/getWorkspaceContentLanguages.ts
import connectToDatabase from '@/utils/connectToDatabase';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from '@/components/language-settings/languages';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';

function normalizeLanguages(raw: unknown): LanguageCode[] {
  if (!Array.isArray(raw)) return [];

  const allowed = new Set<LanguageCode>(
    ALL_LANGUAGES.map((l) => l.code as LanguageCode)
  );

  const filtered = raw
    .map((c) => String(c || '').trim() as LanguageCode)
    .filter((code) => allowed.has(code));

  return Array.from(new Set(filtered));
}

/**
 * Server-Helper: lädt Content-Sprachen direkt aus der workspaces Collection.
 * Gibt IMMER mindestens DEFAULT_LANGUAGES zurück.
 */
export const getWorkspaceContentLanguages = async (
  workspaceId: string
): Promise<LanguageCode[]> => {
  const wid = (workspaceId || '').trim();
  if (!wid) return [...DEFAULT_LANGUAGES];

  try {
    const { db } = await connectToDatabase(process.env.DB_NAME as string);
    const collection = db.collection<WorkspaceDB>('workspaces');

    const workspace = await collection.findOne(
      { _id: wid },
      { projection: { languages: 1 } }
    );

    const content = normalizeLanguages(workspace?.languages?.contentLanguages);

    return content.length ? content : [...DEFAULT_LANGUAGES];
  } catch (err) {
    console.error('getWorkspaceContentLanguages error:', err);
    return [...DEFAULT_LANGUAGES];
  }
};

/**
 * Holt ALLE konfigurierten Sprachen (Content + Frontend + Main)
 */
export async function getWorkspaceLanguages(
  workspaceId: string
): Promise<LanguageCode[]> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<WorkspaceDB>('workspaces');

  const doc = await collection.findOne({ _id: workspaceId });

  const contentLangs = doc?.languages?.contentLanguages ?? [];
  const frontendLangs = doc?.languages?.frontendLanguages ?? [];
  const mainLang = doc?.languages?.mainLanguage;

  const all = [...contentLangs, ...frontendLangs];
  if (mainLang) all.push(mainLang);

  const valid = all.filter((code): code is LanguageCode =>
    ALL_LANGUAGES.map((l) => l.code).includes(code as LanguageCode)
  );

  if (!valid.length) {
    return ['de'];
  }

  return Array.from(new Set(valid));
}

// lib/workspaceLanguages.ts
import connectToDatabase from '@/utils/connectToDatabase';
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGES,
  LanguageCode,
} from '@/components/language-settings/languages';

// Abgeleiteter Sprach-Typ aus deinen CONTENT_LANGUAGES

type WorkspaceLanguagesDoc = {
  workspaceId: string;
  frontendLanguages?: string[];
  contentLanguages?: string[];
  // Legacy-Feld:
  languages?: string[];
  mainLanguage?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

function normalizeLanguages(raw?: string[]): LanguageCode[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<LanguageCode>(ALL_LANGUAGES.map((l) => l.code));

  const filtered = raw
    .map((c) => String(c || '').trim() as LanguageCode)
    .filter((code) => allowed.has(code));

  return Array.from(new Set(filtered));
}

export async function loadWorkspaceLanguages(workspaceId: string): Promise<{
  frontend: LanguageCode[];
  content: LanguageCode[];
  mainLanguage: LanguageCode;
}> {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<WorkspaceLanguagesDoc>('workspaceLanguages');

  const doc = await collection.findOne({ workspaceId });

  // Content:
  // 1) contentLanguages
  // 2) fallback frontendLanguages
  // 3) fallback legacy languages
  // 4) fallback ['de']
  let content = normalizeLanguages(doc?.contentLanguages);
  if (!content.length) {
    content = normalizeLanguages(doc?.frontendLanguages);
  }
  if (!content.length) {
    content = normalizeLanguages(doc?.languages);
  }
  if (!content.length) {
    content = DEFAULT_LANGUAGES;
  }

  // Frontend:
  // 1) frontendLanguages
  // 2) fallback legacy languages
  // 3) fallback content
  // 4) fallback ['de']
  let frontend = normalizeLanguages(doc?.frontendLanguages);
  if (!frontend.length) {
    frontend = normalizeLanguages(doc?.languages);
  }
  if (!frontend.length) {
    frontend = [...content];
  }
  if (!frontend.length) {
    frontend = [DEFAULT_LANGUAGES[0]];
  }

  // Sicherheitsnetz: Frontend ⊆ Content
  frontend = frontend.filter((code) => content.includes(code));
  if (!frontend.length) {
    frontend = [...content];
  }

  // mainLanguage:
  // 1) doc.mainLanguage, wenn gültig & in frontend enthalten
  // 2) erste Frontend-Sprache
  // 3) 'de' als letztes Netz
  let mainLanguage: LanguageCode = DEFAULT_LANGUAGES[0];

  if (
    doc?.mainLanguage &&
    ALL_LANGUAGES.map((l) => l.code).includes(
      doc.mainLanguage as LanguageCode
    ) &&
    frontend.includes(doc.mainLanguage as LanguageCode)
  ) {
    mainLanguage = doc.mainLanguage as LanguageCode;
  } else if (frontend.length > 0) {
    mainLanguage = frontend[0];
  }

  return { frontend, content, mainLanguage };
}

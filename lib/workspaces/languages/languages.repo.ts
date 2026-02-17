import connectToDatabase from '@/utils/connectToDatabase';
import { LanguageCode } from '@/components/language-settings/languages';

export type WorkspaceLanguagesDoc = {
  workspaceId: string;
  frontendLanguages?: LanguageCode[];
  contentLanguages?: LanguageCode[];
  mainLanguage?: LanguageCode;
};

export async function getWorkspaceLanguages(workspaceId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  const ws = await db
    .collection('workspaces')
    .findOne({ _id: workspaceId } as any, { projection: { languages: 1 } });

  return (ws?.languages as WorkspaceLanguagesDoc) || null;
}

export async function saveWorkspaceLanguages(
  workspaceId: string,
  data: WorkspaceLanguagesDoc
) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  // clean data relative to nested object
  const updateData = {
    frontendLanguages: data.frontendLanguages,
    contentLanguages: data.contentLanguages,
    mainLanguage: data.mainLanguage,
  };

  await db
    .collection('workspaces')
    .updateOne({ _id: workspaceId } as any, { $set: { languages: updateData } });
}

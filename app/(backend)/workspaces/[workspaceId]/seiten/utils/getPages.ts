import { notFound } from 'next/navigation';
import { Page, PageDB } from '@/lib/workspaces/pages/pages.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { WorkspaceDB } from '@/lib/workspaces/workspaces.types';

export const getPages = async (workspaceId: string): Promise<Page[]> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  if (!workspaceId || typeof workspaceId !== 'string') {
    notFound();
  }

  const workspacesCollection = db.collection<WorkspaceDB>('workspaces');
  const pagesCollection = db.collection<PageDB>('pages');

  // 1. Workspace existiert?
  const workspace = await workspacesCollection.findOne({ _id: workspaceId });

  if (!workspace) {
    notFound();
  }

  // 2. Seiten laden
  const pages = await pagesCollection.find({ workspaceId }).toArray();

  // 3. Formatieren (IDs sind bei dir eh schon Strings)
  return pages.map((doc) => ({
    _id: doc._id,
    slug: doc.slug,
    name: doc.name || 'Unbenannte Seite',
    createdAt: doc.createdAt || new Date(),
    publishStatus: doc.publishStatus || 'offline',
  })) as Page[];
};

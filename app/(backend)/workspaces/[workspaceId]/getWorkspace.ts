import connectToDatabase from '@/utils/connectToDatabase';
import { Workspace, WorkspaceDB } from '@/lib/workspaces/workspaces.types';

export const getWorkspace = async (
  id: string | null
): Promise<Workspace | null> => {
  if (!id) {
    return null;
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<WorkspaceDB>('workspaces');

  // Versuche, eine ObjectId zu erstellen, falls das Format passt (für Legacy Support)
  // CHANGE: User requested NO Legacy support. Strict String IDs only.
  
  try {
    const workspace = await collection.findOne({ _id: id });

    if (!workspace) return null;

    // ✅ falls noch Alt-Daten existieren: domains rauswerfen (defensiv)
    const { _id, ...rest } = workspace as any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { domains, ...withoutDomains } = rest;

    return {
      ...withoutDomains,
      _id: _id.toString(),
    } as Workspace;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

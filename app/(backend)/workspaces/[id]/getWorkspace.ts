import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import { Workspace } from '@/types';

export const getWorkspace = async (
  id: string | null
): Promise<Workspace | null> => {
  // Prüfe, ob eine ID vorliegt und ob sie ein gültiger 24-stelliger Hex-String ist
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return null;
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection('workspaces');

  try {
    const workspace = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (workspace) {
      return {
        ...workspace,
        _id: (workspace._id as ObjectId).toString(),
      } as Workspace;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

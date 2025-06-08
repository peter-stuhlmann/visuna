import { ObjectId } from 'mongodb';
import connectToDatabase from '@/utils/connectToDatabase';
import { getServerSession } from 'next-auth';
import { Workspace, WorkspaceAccess } from '@/types';

// Interface für die in der DB gespeicherten Workspace-Dokumente
interface FetchedWorkspace {
  _id: ObjectId;
  name: string;
  thumbnail: string;
  access?: WorkspaceAccess[];
  // ggf. weitere Felder...
}

export const getWorkspaces = async (): Promise<Workspace[] | null> => {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  // Benutzer anhand der E-Mail in der Collection "users" suchen
  const usersCollection = db.collection('users');
  const userDoc = await usersCollection.findOne({ email: session.user.email });

  if (
    !userDoc ||
    !userDoc.workspaces ||
    !Array.isArray(userDoc.workspaces) ||
    userDoc.workspaces.length === 0
  ) {
    return null;
  }

  // userDoc.workspaces ist vom Typ Workspace[], also Objekte mit _id als string.
  const workspaces = userDoc.workspaces as string[];

  // Nur gültige ObjectId-Strings berücksichtigen
  const validObjectIds = workspaces
    .map((workspace) => workspace.trim())
    .filter((id: string) => ObjectId.isValid(id))
    .map((id: string) => new ObjectId(id));

  const workspacesCollection = db.collection('workspaces');

  try {
    const fetchedWorkspaces = await workspacesCollection
      .find({
        _id: { $in: validObjectIds },
      })
      .toArray();

    if (fetchedWorkspaces.length > 0) {
      const workspacesWithStringId: Workspace[] = (
        fetchedWorkspaces as FetchedWorkspace[]
      ).map((ws) => ({
        ...ws,
        _id: ws._id.toString(),
        access: ws.access
          ? ws.access.map((entry) => ({
              userId: entry.userId ? entry.userId.toString() : '',
              role: entry.role,
            }))
          : undefined,
      }));

      return workspacesWithStringId;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return null;
  }
};

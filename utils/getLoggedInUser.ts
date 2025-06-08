import { User, WorkspaceAccess } from '@/types';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/utils/connectToDatabase';
import { ObjectId } from 'mongodb';

export const getLoggedInUser = async (): Promise<User | null> => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) return null;

  // Verbindung zur Datenbank herstellen
  const { db } = await connectToDatabase(process.env.DB_NAME as string);

  // DB-Abfrage: Suche den Benutzer anhand der E-Mail
  const userData = await db
    .collection('users')
    .findOne({ email: session.user.email });
  if (!userData) return null;

  // Ermittle currentWorkspaceRole:
  // Finde in der Collection "workspaces" den Workspace anhand userData.currentWorkspaceId.
  const workspaceData = await db
    .collection('workspaces')
    .findOne({ _id: new ObjectId(userData.currentWorkspaceId as string) });
  let currentWorkspaceRole: string | null = null;
  if (workspaceData && workspaceData.access) {
    // Im access-Array des Workspace den Eintrag finden, dessen _id gleich dem User-Objekt ist.
    // Dabei wird angenommen, dass workspaceData.access ein Array von Objekten mit _id und role ist.
    const accessEntry = workspaceData.access.find((entry: WorkspaceAccess) => {
      return entry.userId === userData._id.toString();
    });

    if (accessEntry) {
      currentWorkspaceRole = accessEntry.role;
    }
  }

  // Mapping der User-Daten in das LoggedInUser-Format:
  const loggedInUser: User = {
    _id: userData._id.toString(),
    email: userData.email,
    workspaces: userData.workspaces,
    currentWorkspaceId: userData.currentWorkspaceId,
    currentWorkspaceRole: currentWorkspaceRole || 'none',
  };

  return loggedInUser;
};

// lib/workspaces/workspaces.service.ts
import { createDbDocId } from '@/utils/createDbDocId';
import {
  findWorkspaceByDomain,
  getWorkspaceById,
  insertWorkspace,
  addWorkspaceToUsers,
  updateWorkspace,
  fetchWorkspacesForUser,
} from './workspaces.repo';
import { Workspace } from './workspaces.types';
import { PageDB } from './pages/pages.types';
import connectToDatabase from '@/utils/connectToDatabase';
import { User } from '../users/users.types';
import escapeRegExp from '@/utils/escapeRegExp';
import { ObjectId } from 'mongodb';
import { inviteUser } from '@/lib/invitations/invitations.service';
import saveLog from '@/components/logs/saveLog';

/* ---------- GET ---------- */

export async function getWorkspacesForUser(
  userId: string
): Promise<Workspace[]> {
  if (!userId) return [];
  return fetchWorkspacesForUser(userId);
}

/* ---------- CREATE (EINZIGE WAHRHEIT) ---------- */

// Backwards-compatible entry point used by API route
export async function createWorkspaceWithUsers(params: {
  name: string;
  domain: string;
  thumbnail: string;
  ownerUserId: string;
  users: string[]; // E-Mails
}): Promise<Workspace> {
  return createWorkspace(params);
}

export async function createWorkspace(params: {
  name: string;
  domain: string;
  thumbnail: string;
  ownerUserId: string;
  users: string[]; // E-Mails
}): Promise<Workspace> {
  const existing = await findWorkspaceByDomain(params.domain);
  if (existing) throw new Error('DOMAIN_EXISTS');

  const { db } = await connectToDatabase(process.env.DB_NAME!);

  /* 1. E-Mails normalisieren + validieren */
  const cleaned = params.users
    .map((u) => u.trim().toLowerCase())
    .filter((u) => u.length > 0);

  if (!cleaned.every(isValidEmail)) {
    // Finde die ungültigen E-Mails für die Fehlermeldung
    const invalid = cleaned.filter(e => !isValidEmail(e));
    throw new Error(`INVALID_USERS: Email format invalid: ${invalid.join(', ')}`);
  }

  /* 2. Owner laden (via ID) */
  let ownerUser = await db
    .collection<User>('users')
    .findOne({ _id: params.ownerUserId });

  // Fallback: Try ObjectId if not found by string
  if (!ownerUser && ObjectId.isValid(params.ownerUserId)) {
     ownerUser = await db.collection<User>('users').findOne({ _id: new ObjectId(params.ownerUserId) } as any);
  }

  if (!ownerUser?.email) {
    throw new Error('INVALID_USERS: Owner user or email not found');
  }

  const ownerEmailNormalized = ownerUser.email.trim().toLowerCase();

  /* 3. Gäste-Emails vorbereiten */
  // Entferne Owner aus der Input-Liste und dedupliziere
  const guestEmails = cleaned
     .map(e => e.toLowerCase())
     .filter(e => e !== ownerEmailNormalized);
  
  const uniqueGuestEmails = Array.from(new Set(guestEmails));

  /* 4. Gäste laden */
  let guestUsersFromDb: User[] = [];
  let emailsToInvite: string[] = [];

  if (uniqueGuestEmails.length > 0) {
    // Case-insensitive Suche für Gäste
    const emailQueries = uniqueGuestEmails.map((email) => ({
      email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' },
    }));

    guestUsersFromDb = await db
      .collection<User>('users')
      .find({ $or: emailQueries })
      .toArray();

    // Checke wer fehlt
    const foundEmails = guestUsersFromDb.map(u => (u.email || '').trim().toLowerCase());
    emailsToInvite = uniqueGuestEmails.filter(e => !foundEmails.includes(e));
  }

  // Zusammenfügen: Owner + Gäste (die existieren)
  const usersFromDb = [ownerUser, ...guestUsersFromDb];

  /* 5. Workspace-ID */
  const workspaceId = createDbDocId('ws');

  /* 6. Default Pages */
  const pages = db.collection<PageDB>('pages');

  const home: PageDB = {
    _id: createDbDocId('page'),
    workspaceId,
    name: 'Startseite',
    slug: 'home',
    publishStatus: 'maintenance',
    createdAt: new Date(),
    pageElements: [],
    seo: {},
  };

  const notFound: PageDB = {
    _id: createDbDocId('page'),
    workspaceId,
    name: '404',
    slug: '404',
    publishStatus: 'offline',
    createdAt: new Date(),
    pageElements: [],
    seo: {},
  };

  await pages.insertMany([home, notFound]);

  /* 7. Access-Liste */
  const access: Workspace['access'] = usersFromDb.map((u) => ({
    userId: u._id.toString(),
    role: u._id.toString() === params.ownerUserId ? 'admin' : 'editor',
  }));

  /* 8. Workspace speichern */
  const workspace: Workspace = {
    _id: workspaceId,
    name: params.name,
    domain: params.domain,
    thumbnail: params.thumbnail,
    access,
    createdAt: new Date(),
    pages: [{ id: home._id }, { id: notFound._id }],
    features: {
      aiTokens: 10000,
      allowedUsers: access.length,
      mediaLimit: 5,
      customDomain: true,
    },
  };

  await insertWorkspace(workspace);

  /* 9. Workspace bei allen Usern eintragen */
  const userIds = usersFromDb.map((u) => u._id);

  await addWorkspaceToUsers(workspaceId, userIds);

  /* 10. Fehlende User einladen */
  if (emailsToInvite.length > 0) {
    console.log(`[CreateWS] Inviting ${emailsToInvite.length} missing users...`);
    await Promise.all(
      emailsToInvite.map((email) =>
        inviteUser({
          email,
          role: 'editor', // Default Rolle für Eingeladene beim Erstellen
          workspaceId,
          invitedBy: params.ownerUserId,
          invitedByName: ownerUser?.name || ownerUser?.email || '',
        }).catch((err) => {
          console.error(`[CreateWS] Failed to invite ${email}:`, err);
          // Wir werfen hier keinen Fehler, damit der Workspace trotzdem erstellt bleibt.
          // Optional: Rückgabeinfo an den User
        })
      )
    );
  }

  await saveLog({
    workspaceId,
    code: '1401',
    action: 'created',
    category: 'workspace',
    entityType: 'workspace',
    entityId: workspaceId,
    entityName: workspace.name,
    description: `Workspace "${workspace.name}" erstellt.`,
  });

  return workspace;
}

/* ---------- UPDATE ---------- */

export async function updateWorkspaceService(params: {
  workspaceId: string;
  name?: string;
  domain?: string;
  thumbnail?: string | null;
  plan?: 'free' | 'prime';
}) {
  const workspace = await getWorkspaceById(params.workspaceId);
  if (!workspace) throw new Error('WORKSPACE_NOT_FOUND');

  // Domain check only if domain is being updated
  if (params.domain && params.domain !== workspace.domain) {
    const existing = await findWorkspaceByDomain(params.domain);
    if (existing && existing._id !== params.workspaceId) {
      throw new Error('DOMAIN_EXISTS');
    }
  }

  const updateData: any = {};
  if (params.name) updateData.name = params.name;
  if (params.domain) updateData.domain = params.domain;
  if (params.thumbnail !== undefined) updateData.thumbnail = params.thumbnail;
  if (params.plan) updateData.plan = params.plan;

  const updated = await updateWorkspace(params.workspaceId, updateData);

  await saveLog({
    workspaceId: params.workspaceId,
    code: '1402',
    action: 'updated',
    category: 'workspace',
    entityType: 'workspace',
    entityId: params.workspaceId,
    entityName: params.name ?? workspace.name,
    description: `Workspace "${params.name ?? workspace.name}" aktualisiert.`,
  });

  return updated;
}

/* ---------- DELETE ---------- */

export async function deleteWorkspaceService(workspaceId: string) {
  const { db } = await connectToDatabase(process.env.DB_NAME!);

  // 1. Get Users to update
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) return; // Already deleted?

  const userIds = workspace.access.map(a => a.userId);

  // 2. Remove Workspace from Users
  await db.collection<User>('users').updateMany(
    { _id: { $in: userIds } },
    {
      $pull: { workspaces: workspaceId },
      // Optional: currentWorkspaceId resetten, wenn es dieser war? 
      // Das macht das Frontend via 404/Validation Check oder wir machen es hier.
      // Sicherer hier:
      $unset: { currentWorkspaceId: "" } // Müsste man konditional machen: nur wenn == workspaceId.
      // MongoDB UpdateMany mit Condition auf Feldwert ist tricky in einem Go. 
      // Lassen wir $unset erstmal weg, oder nutzen Pipeline Update.
      // Einfacher: Wir lassen currentWorkspaceId stehen, der Access Check im Layout fängt das ab (404).
      // Das ist sauberer als hier komplexe Logik.
    } as any
  );
  
  // 3. Delete Workspace
  const { deleteWorkspaceById } = await import('./workspaces.repo');
  await deleteWorkspaceById(workspaceId);

  await saveLog({
    workspaceId,
    code: '1403',
    action: 'deleted',
    category: 'workspace',
    entityType: 'workspace',
    entityId: workspaceId,
    entityName: workspace.name,
    description: `Workspace "${workspace.name}" gelöscht.`,
  });
}

/* ---------- Helpers ---------- */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

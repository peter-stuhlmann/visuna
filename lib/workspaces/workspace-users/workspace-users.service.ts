// lib/workspaces/workspace-users/workspace-users.service.ts
import {
  getWorkspaceById,
  removeUserFromWorkspace,
  countUserWorkspaces,
} from './workspace-users.repo';
import { deleteUser, removeWorkspaceFromUser } from '@/lib/users/users.repo';

export async function revokeUserFromWorkspace(
  workspaceId: string,
  userId: string
) {
  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throw new Error('NOT_FOUND');

  const isInWorkspace = workspace.access?.some((a: any) => a.userId === userId);

  if (!isInWorkspace) throw new Error('NOT_FOUND');

  // Access entfernen
  await removeUserFromWorkspace(workspaceId, userId);

  // Prüfen ob User noch andere Workspaces hat
  const remaining = await countUserWorkspaces(userId);

  if (remaining === 0) {
    // User komplett löschen (war nur eingeladen)
    await deleteUser(userId);
  } else {
    // Nur Workspace aus User entfernen
    await removeWorkspaceFromUser(userId, workspaceId);
  }
}

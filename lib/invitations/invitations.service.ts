// lib/invitations/invitations.service.ts
import crypto from 'crypto';
import { sendInvitationMail } from '@/utils/mailer';
import { isValidRole, ASSIGNABLE_ROLES, type RoleKey } from '@/lib/roles/roles';
import {
  findUserByEmail,
  createInvitedUser,
  addWorkspaceToUser,
} from '@/lib/users/users.repo';
import {
  getWorkspaceById,
  addUserToWorkspace,
  isUserInWorkspace,
  insertInvitation,
  findInvitationByToken,
  findInvitationById,
  updateInvitationStatus,
  updateInvitationToken,
  deleteInvitationById,
  findInvitationsByWorkspace,
  findPendingInvitationByEmail,
} from './invitations.repo';
import { createDbDocId } from '@/utils/createDbDocId';
import type { InvitationDB } from './invitations.types';
import saveLog from '@/components/logs/saveLog';

/* ---------- Helpers ---------- */

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function throwValidation(msg: string): never {
  const err = new Error('VALIDATION_ERROR');
  (err as any).details = msg;
  throw err;
}

/* ---------- Invite ---------- */

type InviteInput = {
  email: string;
  role: RoleKey;
  workspaceId: string;
  invitedBy: string;       // userId
  invitedByName?: string;  // display name
};

export async function inviteUser(input: InviteInput) {
  const { email, role, workspaceId, invitedBy, invitedByName } = input;

  if (!email) throwValidation('E-Mail-Adresse erforderlich.');
  if (!workspaceId || typeof workspaceId !== 'string')
    throwValidation('Workspace erforderlich.');
  if (!ASSIGNABLE_ROLES.includes(role as any))
    throwValidation(`„${role}" ist keine gültige Rolle.`);

  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) throwValidation('Workspace existiert nicht.');

  // Already have access?
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const alreadyIn = await isUserInWorkspace(workspaceId, existingUser._id!);
    if (alreadyIn) throw new Error('ALREADY_INVITED');
  }

  // Pending invitation already?
  const pendingInv = await findPendingInvitationByEmail(email, workspaceId);
  if (pendingInv) throw new Error('ALREADY_INVITED');

  const token = generateToken();
  const invitation: InvitationDB = {
    _id: createDbDocId('inv'),
    workspaceId,
    email: email.trim().toLowerCase(),
    role,
    status: 'pending',
    token,
    invitedBy,
    invitedByName: invitedByName || '',
    workspaceName: workspace.name || '',
    createdAt: new Date(),
  };

  await insertInvitation(invitation);
  await sendInvitationMail(email, token, workspace.name, invitedByName || 'Jemand');

  await saveLog({
    workspaceId,
    code: '1601',
    action: 'invited',
    category: 'invitation',
    entityType: 'invitation',
    entityId: invitation._id,
    entityName: email,
    description: `Benutzer "${email}" eingeladen.`,
    details: { role },
  });

  return invitation;
}

/* ---------- Accept ---------- */

export async function acceptInvitation(token: string) {
  const invitation = await findInvitationByToken(token);
  if (!invitation) throw new Error('INVITATION_NOT_FOUND');
  if (invitation.status !== 'pending') throw new Error('INVITATION_ALREADY_RESPONDED');

  // Mark as accepted
  await updateInvitationStatus(invitation._id, 'accepted');

  // Find or create user
  let user = await findUserByEmail(invitation.email);
  if (!user) {
    // Create a stub user — they'll complete registration via the normal flow
    user = await createInvitedUser(invitation.email, invitation.workspaceId);
  } else {
    // Add workspace to existing user
    await addWorkspaceToUser(user._id!, invitation.workspaceId);
  }

  // Add user to workspace access
  const alreadyIn = await isUserInWorkspace(invitation.workspaceId, user._id!);
  if (!alreadyIn) {
    await addUserToWorkspace(invitation.workspaceId, user._id!, invitation.role);
  }

  await saveLog({
    workspaceId: invitation.workspaceId,
    code: '1602',
    action: 'updated',
    category: 'invitation',
    entityType: 'invitation',
    entityId: invitation._id,
    entityName: invitation.email,
    description: `Einladung für "${invitation.email}" angenommen.`,
  });

  return { invitation, user };
}

/* ---------- Decline ---------- */

export async function declineInvitation(token: string) {
  const invitation = await findInvitationByToken(token);
  if (!invitation) throw new Error('INVITATION_NOT_FOUND');
  if (invitation.status !== 'pending') throw new Error('INVITATION_ALREADY_RESPONDED');

  await updateInvitationStatus(invitation._id, 'declined');

  await saveLog({
    workspaceId: invitation.workspaceId,
    code: '1603',
    action: 'updated',
    category: 'invitation',
    entityType: 'invitation',
    entityId: invitation._id,
    entityName: invitation.email,
    description: `Einladung für "${invitation.email}" abgelehnt.`,
  });

  return invitation;
}

/* ---------- Re-invite ---------- */

export async function reinviteUser(invitationId: string) {
  const invitation = await findInvitationById(invitationId);
  if (!invitation) throw new Error('INVITATION_NOT_FOUND');

  const newToken = generateToken();
  await updateInvitationToken(invitation._id, newToken);

  await sendInvitationMail(
    invitation.email,
    newToken,
    invitation.workspaceName || '',
    invitation.invitedByName || 'Jemand'
  );

  await saveLog({
    workspaceId: invitation.workspaceId,
    code: '1605',
    action: 'updated',
    category: 'invitation',
    entityType: 'invitation',
    entityId: invitation._id,
    entityName: invitation.email,
    description: `Erneute Einladung an "${invitation.email}" gesendet.`,
  });

  return { ...invitation, token: newToken, status: 'pending' as const };
}

/* ---------- Delete ---------- */

export async function removeInvitation(invitationId: string) {
  return deleteInvitationById(invitationId);
}

/* ---------- Revoke (withdraw pending) ---------- */

export async function revokeInvitation(invitationId: string) {
  const invitation = await findInvitationById(invitationId);
  if (!invitation) throw new Error('INVITATION_NOT_FOUND');
  if (invitation.status !== 'pending') throw new Error('NOT_PENDING');

  await updateInvitationStatus(invitation._id, 'revoked');

  await saveLog({
    workspaceId: invitation.workspaceId,
    code: '1604',
    action: 'revoked',
    category: 'invitation',
    entityType: 'invitation',
    entityId: invitation._id,
    entityName: invitation.email,
    description: `Einladung für "${invitation.email}" widerrufen.`,
  });

  return invitation;
}

/* ---------- Query ---------- */

export async function getInvitationsForWorkspace(workspaceId: string) {
  return findInvitationsByWorkspace(workspaceId);
}

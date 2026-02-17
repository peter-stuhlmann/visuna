// lib/invitations/invitations.types.ts
import type { RoleKey } from '@/lib/roles/roles';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export type InvitationDB = {
  _id: string;
  workspaceId: string;
  email: string;
  role: RoleKey;
  status: InvitationStatus;
  token: string;
  invitedBy: string; // userId
  invitedByName?: string; // display name for email
  workspaceName?: string; // for email & landing page
  createdAt: Date;
  respondedAt?: Date;
};

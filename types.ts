import { ObjectId } from 'mongodb';

export type WorkspaceDb = {
  _id: ObjectId;
  name: string;
  thumbnail: string;
  access?: WorkspaceAccess[];
};

export type Workspace = {
  _id: string;
  name: string;
  thumbnail: string;
  access?: WorkspaceAccess[];
};

export type User = {
  _id: string | ObjectId;
  email: string;
  currentWorkspaceId: string | null;
  workspaces: string[];
  currentWorkspaceRole: string;
  createdAt?: string;
  verified?: boolean;
};

export type WorkspaceAccess = {
  userId: string;
  role: string;
};

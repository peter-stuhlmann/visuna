export type UserPreferences = {
  mediaPoolViewMode?: 'grid' | 'collage';
};

export type UserDB = {
  _id: string;
  email?: string;
  verified?: boolean;
  createdAt?: Date;
  workspaces: string[];
  currentWorkspaceId?: string | null;
  password?: string;
  verificationCode?: string;
  expiresAt?: Date;
  passwordUpdatedAt?: Date;
  name?: string;
  avatarUrl?: string;
  birthday?: string;
  slogan?: string;
  preferences?: UserPreferences;
};

export type User = {
  _id: string;
  email?: string;
  verified?: boolean;
  createdAt?: Date;
  workspaces: string[];
  currentWorkspaceId?: string | null;
  name?: string;
  avatarUrl?: string;
  birthday?: string;
  slogan?: string;
  preferences?: UserPreferences;
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  verified?: boolean;
};

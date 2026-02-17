import { LanguageCode } from '@/components/language-settings/languages';

// lib/workspaces/workspaces.types.ts
export type WorkspaceAccess = {
  userId: string;
  role: 'superadmin' | 'admin' | 'editor' | 'read-only';
  displayName?: string;
  avatarUrl?: string;
};

export type WorkspaceDB = {
  _id: string;
  name: string;
  domain: string;
  thumbnail?: string;
  access: WorkspaceAccess[];
  createdAt: Date;
  pages: { id: string }[];
  languages?: {
    frontendLanguages?: string[];
    contentLanguages?: string[];
    mainLanguage?: LanguageCode;
  };
  features: {
    aiTokens: number;
    allowedUsers: number;
    mediaLimit: number;
    customDomain: boolean;
  };
  plan?: 'free' | 'prime';
};

export type Workspace = {
  _id: string;
  name: string;
  domain: string;
  thumbnail?: string;
  access: WorkspaceAccess[];
  createdAt: Date;
  pages: { id: string }[];
  languages?: {
    frontendLanguages?: string[];
    contentLanguages?: string[];
    mainLanguage?: LanguageCode;
  };
  features: {
    aiTokens: number;
    allowedUsers: number;
    mediaLimit: number;
    customDomain: boolean;
  };
  plan?: 'free' | 'prime';
};

export type WorkspaceListItem = {
  _id: string;
  name: string;
  thumbnail: string;
  domain: string;
  access: {
    userId: string;
    role: string;
  }[];
  plan?: 'free' | 'prime';
};

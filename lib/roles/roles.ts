// lib/roles/roles.ts

export type RoleKey = 'superadmin' | 'admin' | 'editor' | 'read-only';

type MultiLang = { de: string; en: string };

export type RoleDefinition = {
  key: RoleKey;
  label: MultiLang;
  description: MultiLang;
};

export const ROLES: Record<RoleKey, RoleDefinition> = {
  superadmin: {
    key: 'superadmin',
    label: { de: 'Superadmin', en: 'Super Admin' },
    description: {
      de: 'Vollzugriff auf alle Workspaces und Systemeinstellungen.',
      en: 'Full access to all workspaces and system settings.',
    },
  },
  admin: {
    key: 'admin',
    label: { de: 'Admin', en: 'Admin' },
    description: {
      de: 'Kann den Workspace verwalten, Mitglieder einladen und alle Inhalte bearbeiten.',
      en: 'Can manage the workspace, invite members and edit all content.',
    },
  },
  editor: {
    key: 'editor',
    label: { de: 'Editor', en: 'Editor' },
    description: {
      de: 'Kann Seiten und Inhalte erstellen und bearbeiten.',
      en: 'Can create and edit pages and content.',
    },
  },
  'read-only': {
    key: 'read-only',
    label: { de: 'Nur Lesen', en: 'Read Only' },
    description: {
      de: 'Kann Inhalte ansehen, aber nicht bearbeiten.',
      en: 'Can view content but cannot edit.',
    },
  },
};

/** All valid role keys */
export const ROLE_KEYS = Object.keys(ROLES) as RoleKey[];

/** Roles assignable via the website (excludes superadmin) */
export const ASSIGNABLE_ROLES = ROLE_KEYS.filter((k) => k !== 'superadmin');

/** Get a human-readable role label */
export function getRoleLabel(key: string, lang: 'de' | 'en' = 'de'): string {
  const role = ROLES[key as RoleKey];
  return role ? role.label[lang] : key;
}

/** Get a role description */
export function getRoleDescription(key: string, lang: 'de' | 'en' = 'de'): string {
  const role = ROLES[key as RoleKey];
  return role ? role.description[lang] : '';
}

/** Check if a string is a valid role key */
export function isValidRole(key: string): key is RoleKey {
  return key in ROLES;
}

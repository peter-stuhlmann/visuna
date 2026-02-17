// components/logs/helpers/getTableData.tsx

import React from 'react';
import { Log } from '../Logs.types';

/**
 * Category display labels (German).
 */
const CATEGORY_LABELS: Record<string, string> = {
  page: 'Seite',
  template: 'Template',
  page_element: 'Seitenelement',
  seo: 'SEO',
  media: 'Medien',
  user: 'Benutzer',
  workspace: 'Workspace',
  invitation: 'Einladung',
  language: 'Sprachen',
  ai: 'KI',
  auth: 'Anmeldung',
};

type Column = {
  thead: string;
  tbody: (React.ReactNode | null)[];
};

export function getTableData(logs: Log[] | null): Column[] {
  if (!logs) return [];

  return [
    {
      thead: 'Code',
      tbody: logs.map((log) => log.code ?? '–'),
    },
    {
      thead: 'Datum',
      tbody: logs.map((log) => {
        const raw = log.createdAt ?? log.timestamp;
        if (!raw) return '–';
        return new Date(raw).toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }),
    },
    {
      thead: 'Beschreibung',
      tbody: logs.map((log) => log.description ?? log.activity ?? '–'),
    },
    {
      thead: 'Kategorie',
      tbody: logs.map((log) => {
        const cat = log.category;
        if (!cat) return '–';
        return CATEGORY_LABELS[cat] ?? cat;
      }),
    },
    {
      thead: 'Benutzer',
      tbody: logs.map(
        (log) => log.userName ?? log.userEmail ?? log.email ?? '–'
      ),
    },
  ];
}

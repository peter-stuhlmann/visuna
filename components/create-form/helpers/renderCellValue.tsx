import { Form } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';
import React from 'react';

type TableDefinition = {
  field?: string;
  format?: (value: string) => string;
  tbody?: (form: Form) => React.ReactNode;
};

const renderCellValue = (
  form: Form,
  table: TableDefinition
): React.ReactNode => {
  if (table.field) {
    const value = form[table.field as keyof Form];
    // Falls eine Formatierungsfunktion existiert und der Wert ein string ist:
    if (table.format && typeof value === 'string') {
      return table.format(value);
    }
    // Wenn der Wert ein Array ist, mappe es in JSX-Elemente um
    if (Array.isArray(value)) {
      return value.map((item: unknown, index: number) => {
        if (
          typeof item === 'object' &&
          item !== null &&
          'name' in item &&
          typeof (item as { name: string }).name === 'string'
        ) {
          return (
            <span key={index}>
              {(item as { name: string }).name}
              {index < value.length - 1 && ', '}
            </span>
          );
        }
        return (
          <span key={index}>
            {JSON.stringify(item)}
            {index < value.length - 1 && ', '}
          </span>
        );
      });
    }
    // Andernfalls den Wert direkt zurückgeben (string, number, boolean oder Element)
    return value as React.ReactNode;
  } else if (table.tbody) {
    return table.tbody(form);
  }
  return null;
};

export default renderCellValue;

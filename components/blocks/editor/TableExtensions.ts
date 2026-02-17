// TableExtensions.ts
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

import type { AnyExtension } from '@tiptap/core';

/**
 * Hinweis:
 * - resizable: true -> Spalten per Drag anpassen (falls CSS/Handle passt)
 * - allowTableNodeSelection: hilfreich fürs Löschen/Handling
 */
export const TableExtensions: AnyExtension[] = [
  Table.configure({
    resizable: true,
    allowTableNodeSelection: true,
    // lastColumnResizable: true, // optional
  }) as AnyExtension,

  TableRow as AnyExtension,
  TableHeader as AnyExtension,
  TableCell as AnyExtension,
];

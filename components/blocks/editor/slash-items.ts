import type { Editor } from '@tiptap/react';
import type { Range } from '@tiptap/core';

export type SlashCommandItem = {
  title: string;
  description: string;
  keywords: string[];
  icon: string;

  // wenn true -> Item NICHT anzeigen (wir filtern im UI)
  isDisabled?: (ctx: { editor: Editor }) => boolean;

  // optional: für dein Grid-Panel
  opensPanel?: 'table-grid';

  command: (ctx: { editor: Editor; range: Range }) => void;
};

const inTable = (editor: Editor) => editor.isActive('table');

const hideWhenCannot =
  (can: (editor: Editor) => boolean) =>
  ({ editor }: { editor: Editor }) =>
    !can(editor);

export const slashItems: SlashCommandItem[] = [
  {
    title: 'Text',
    description: 'Normaler Absatz',
    keywords: ['p', 'paragraph', 'text'],
    icon: 'T',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },

  ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    title: `Heading ${level}`,
    description: `Überschrift H${level}`,
    keywords: [`h${level}`, 'heading', 'title'],
    icon: `H${level}`,
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level })
        .run();
    },
  })),

  {
    title: 'Bullet List',
    description: 'Aufzählung',
    keywords: ['ul', 'bullet', 'list', 'unordered'],
    icon: '•',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Ordered List',
    description: 'Nummerierte Liste',
    keywords: ['ol', 'ordered', 'list', 'numbered'],
    icon: '1.',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Blockquote',
    description: 'Zitat / Hervorhebung',
    keywords: ['quote', 'blockquote'],
    icon: '“ ”',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Code als Block',
    keywords: ['code', 'codeblock', 'pre'],
    icon: '</>',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Trennlinie',
    keywords: ['hr', 'divider', 'separator', 'line'],
    icon: '—',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // =========================
  // TABLE: Insert
  // =========================

  // ✅ optional: dein Table-Grid Picker
  {
    title: 'Table',
    description: 'Tabelle einfügen (Grid auswählen)',
    keywords: ['table', 'tabelle', 'grid'],
    icon: '▦',
    opensPanel: 'table-grid',
    command: () => {},
  },

  // ✅ 3×3 bleibt, 2×2 ist raus
  {
    title: 'Table 3×3',
    description: 'Tabelle 3×3 einfügen',
    keywords: ['table', 'tabelle', '3x3'],
    icon: '▦',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },

  // =========================
  // TABLE: Columns
  // =========================
  {
    title: 'Add column left',
    description: 'Spalte links hinzufügen',
    keywords: ['table', 'column', 'spalte', 'left', 'before'],
    icon: '⟵▥',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().addColumnBefore()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).addColumnBefore().run();
    },
  },
  {
    title: 'Add column right',
    description: 'Spalte rechts hinzufügen',
    keywords: ['table', 'column', 'spalte', 'right', 'after'],
    icon: '▥⟶',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().addColumnAfter()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).addColumnAfter().run();
    },
  },
  {
    title: 'Delete column',
    description: 'Spalte löschen',
    keywords: ['table', 'column', 'spalte', 'delete', 'remove'],
    icon: '✕▥',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().deleteColumn()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).deleteColumn().run();
    },
  },

  // =========================
  // TABLE: Rows
  // =========================
  {
    title: 'Add row above',
    description: 'Zeile oberhalb hinzufügen',
    keywords: ['table', 'row', 'zeile', 'above', 'before'],
    icon: '⟰',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().addRowBefore()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).addRowBefore().run();
    },
  },
  {
    title: 'Add row below',
    description: 'Zeile unterhalb hinzufügen',
    keywords: ['table', 'row', 'zeile', 'below', 'after'],
    icon: '⟱',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().addRowAfter()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).addRowAfter().run();
    },
  },
  {
    title: 'Delete row',
    description: 'Zeile löschen',
    keywords: ['table', 'row', 'zeile', 'delete', 'remove'],
    icon: '✕',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().deleteRow()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).deleteRow().run();
    },
  },

  // =========================
  // TABLE: Other
  // =========================
  {
    title: 'Delete table',
    description: 'Tabelle komplett löschen',
    keywords: ['table', 'tabelle', 'delete', 'remove'],
    icon: '🗑',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().deleteTable()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).deleteTable().run();
    },
  },
  {
    title: 'Merge cells',
    description: 'Zellen verbinden',
    keywords: ['table', 'merge', 'cells', 'verbinden'],
    icon: '⧉',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().mergeCells()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).mergeCells().run();
    },
  },
  {
    title: 'Split cell',
    description: 'Zelle teilen',
    keywords: ['table', 'split', 'cell', 'teilen'],
    icon: '⧄',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().splitCell()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).splitCell().run();
    },
  },
  {
    title: 'Toggle header row',
    description: 'Header-Zeile an/aus',
    keywords: ['table', 'header', 'row', 'thead'],
    icon: 'H↔',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().toggleHeaderRow()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeaderRow().run();
    },
  },
  {
    title: 'Toggle header column',
    description: 'Header-Spalte an/aus',
    keywords: ['table', 'header', 'column'],
    icon: 'H↕',
    isDisabled: hideWhenCannot(
      (e) => inTable(e) && e.can().toggleHeaderColumn()
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeaderColumn().run();
    },
  },
  {
    title: 'Fix tables',
    description: 'Tabelle reparieren (fixTables)',
    keywords: ['table', 'fix', 'repair'],
    icon: '🛠',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().fixTables()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).fixTables().run();
    },
  },
  {
    title: 'Next cell',
    description: 'Zur nächsten Zelle springen',
    keywords: ['table', 'next', 'cell', 'tab'],
    icon: '↦',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().goToNextCell()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).goToNextCell().run();
    },
  },
  {
    title: 'Previous cell',
    description: 'Zur vorherigen Zelle springen',
    keywords: ['table', 'prev', 'cell', 'shift+tab'],
    icon: '↤',
    isDisabled: hideWhenCannot((e) => inTable(e) && e.can().goToPreviousCell()),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).goToPreviousCell().run();
    },
  },
];

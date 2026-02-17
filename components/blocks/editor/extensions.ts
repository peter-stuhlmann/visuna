import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';

import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';

import type { AnyExtension } from '@tiptap/core';
import { TableKit } from '@tiptap/extension-table';

import { DragHandleExtension } from './DragHandleExtension';

export const extensions: AnyExtension[] = [
  StarterKit.configure({
    heading: false,
  }) as AnyExtension,

  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }) as AnyExtension,

  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }) as AnyExtension,

  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
  }) as AnyExtension,

  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'paragraph') return "Press '/' for commands";
      return '';
    },
    includeChildren: false,
    showOnlyCurrent: true,
  }) as AnyExtension,

  TextStyle as AnyExtension,
  Color.configure({ types: ['textStyle'] }) as AnyExtension,

  Highlight.configure({ multicolor: true }) as AnyExtension,

  Superscript as AnyExtension,
  Subscript as AnyExtension,

  Underline as AnyExtension,

  // ✅ TableKit wie im TipTap Beispiel
  TableKit.configure({
    table: { resizable: true },
  }) as AnyExtension,

  // optional
  DragHandleExtension as unknown as AnyExtension,
];

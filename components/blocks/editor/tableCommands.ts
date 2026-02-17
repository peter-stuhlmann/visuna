// tableCommands.ts
import type { Editor } from '@tiptap/react';

export function insertDefaultTable(editor: Editor) {
  return editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}

export function addRowAfter(editor: Editor) {
  return editor.chain().focus().addRowAfter().run();
}

export function addRowBefore(editor: Editor) {
  return editor.chain().focus().addRowBefore().run();
}

export function deleteRow(editor: Editor) {
  return editor.chain().focus().deleteRow().run();
}

export function addColumnAfter(editor: Editor) {
  return editor.chain().focus().addColumnAfter().run();
}

export function addColumnBefore(editor: Editor) {
  return editor.chain().focus().addColumnBefore().run();
}

export function deleteColumn(editor: Editor) {
  return editor.chain().focus().deleteColumn().run();
}

export function deleteTable(editor: Editor) {
  return editor.chain().focus().deleteTable().run();
}

export function toggleHeaderRow(editor: Editor) {
  return editor.chain().focus().toggleHeaderRow().run();
}

export function toggleHeaderColumn(editor: Editor) {
  return editor.chain().focus().toggleHeaderColumn().run();
}

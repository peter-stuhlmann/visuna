import type { Editor } from '@tiptap/react';

export type NotionEditorProps = {
  value?: string;
  onChange?: (html: string, editor: Editor) => void;
  editable?: boolean;
  className?: string;
};

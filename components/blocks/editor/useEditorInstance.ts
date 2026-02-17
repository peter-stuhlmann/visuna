'use client';

import { useEditor } from '@tiptap/react';
import type { NotionEditorProps } from './types';
import { extensions } from './extensions';

export const useEditorInstance = ({
  value,
  onChange,
  editable = true,
}: Pick<NotionEditorProps, 'value' | 'onChange' | 'editable'>) => {
  return useEditor({
    extensions,
    content: value ?? '<p></p>',
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML(), editor);
    },
  });
};

import { Extension } from '@tiptap/core';
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { PluginKey } from 'prosemirror-state';

import { SlashMenu, type SlashMenuHandle } from './SlashMenu';
import { slashItems } from './slash-items';

type CreateSlashCommandOptions = {
  /**
   * Muss pro Editor-Instanz eindeutig sein.
   * z.B. elementId + lang oder ein random mount key.
   */
  key: string;
};

export const createSlashCommandExtension = ({
  key,
}: CreateSlashCommandOptions) => {
  // ✅ eindeutig pro Editor
  const pluginKey = new PluginKey(`slash-command-suggestion:${key}`);

  return Extension.create({
    name: 'slashCommand',

    addProseMirrorPlugins() {
      const editor = this.editor;

      return [
        Suggestion({
          editor,
          pluginKey, // ✅ keine Kollision mehr

          char: '/',

          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            const textBefore = $from.parent.textBetween(
              0,
              $from.parentOffset,
              '\0',
              '\0'
            );
            const lastChar = textBefore.slice(-1);
            const okStart = textBefore.length === 0;
            const okAfterSpace = lastChar === ' ';

            const inCodeBlock = $from.parent.type.name === 'codeBlock';
            return !inCodeBlock && (okStart || okAfterSpace);
          },

          items: ({ query }) => {
            const q = query.trim().toLowerCase();
            if (!q) return slashItems;

            return slashItems.filter((it) => {
              const hay = [it.title, it.description, ...(it.keywords ?? [])]
                .join(' ')
                .toLowerCase();
              return hay.includes(q);
            });
          },

          render: () => {
            let reactRenderer: ReactRenderer<SlashMenuHandle> | null = null;
            let popup: TippyInstance | null = null;

            return {
              onStart: (props: SuggestionProps) => {
                reactRenderer = new ReactRenderer(SlashMenu, {
                  editor: props.editor,
                  props: {
                    editor: props.editor,
                    range: props.range,
                    query: props.query,
                    items: slashItems,
                    onRequestClose: () => popup?.hide(),
                  },
                });

                if (!props.clientRect) return;

                popup = tippy(document.body, {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  offset: [0, 8],
                  maxWidth: 'none',
                });
              },

              onUpdate: (props: SuggestionProps) => {
                reactRenderer?.updateProps({
                  editor: props.editor,
                  range: props.range,
                  query: props.query,
                  items: slashItems,
                  onRequestClose: () => popup?.hide(),
                });

                if (!props.clientRect) return;

                popup?.setProps({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  getReferenceClientRect: props.clientRect as any,
                });
              },

              onKeyDown: (props: SuggestionKeyDownProps) => {
                if (props.event.key === 'Escape') {
                  popup?.hide();
                  return true;
                }

                const handled = reactRenderer?.ref?.onKeyDown?.(props.event);
                return !!handled;
              },

              onExit: () => {
                popup?.destroy();
                popup = null;

                reactRenderer?.destroy();
                reactRenderer = null;
              },
            };
          },
        }),
      ];
    },
  });
};

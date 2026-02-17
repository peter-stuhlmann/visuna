'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';

import { Plugin } from '@tiptap/pm/state';
import { keymap } from '@tiptap/pm/keymap';
import { Slice } from '@tiptap/pm/model';

import { extensions as baseExtensions } from './extensions';
import { createSlashCommandExtension } from './SlashCommandExtension';
import { BubbleMenu } from './BubbleMenu';
import { EditorSurface, Wrapper } from './styles';

import 'tippy.js/dist/tippy.css';

export type SingleLineElement = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type Props = {
  value?: string;
  onChange?: (html: string) => void;

  singleLine?: boolean;

  element?: SingleLineElement;
  onElementChange?: (el: SingleLineElement) => void;

  languageCode?: string;
  maxChars?: number;
};

const SingleLineExtension = Extension.create({
  name: 'singleLine',
  addProseMirrorPlugins() {
    const enterKeymap = keymap({
      Enter: () => true,
      'Shift-Enter': () => true,
    });

    const pastePlugin = new Plugin({
      props: {
        handlePaste(view, _event, slice) {
          const first = slice.content.firstChild;
          if (!first) return false;

          const inlineFragment = first.content;
          const tr = view.state.tr.replaceSelection(
            new Slice(inlineFragment, 0, 0)
          );
          view.dispatch(tr.scrollIntoView());
          return true;
        },
      },
    });

    return [enterKeymap, pastePlugin];
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterOutByName(exts: any[], names: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return exts.filter((ext) => !names.includes((ext as any)?.name));
}

function parseFirstElement(html: string): HTMLElement | null {
  if (!html || typeof html !== 'string') return null;
  const container = document.createElement('div');
  container.innerHTML = html.trim();
  return container.firstElementChild as HTMLElement | null;
}

function toSpanHtmlFromEditorHtml(editorHtml: string): string {
  const el = parseFirstElement(editorHtml);
  if (!el) return '<span></span>';

  if (el.tagName.toLowerCase() === 'span') {
    return el.outerHTML;
  }

  const span = document.createElement('span');

  const style = el.getAttribute('style');
  if (style && style.trim()) span.setAttribute('style', style);

  const cls = el.getAttribute('class');
  if (cls && cls.trim()) span.setAttribute('class', cls);

  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('data-')) {
      span.setAttribute(attr.name, attr.value);
    }
  }

  span.innerHTML = el.innerHTML;
  return span.outerHTML;
}

function toEditorContentFromStoredSingleLine(value?: string): string {
  const fallback = '<p></p>';
  if (!value || typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const el = parseFirstElement(trimmed);
  if (!el) return fallback;

  if (el.tagName.toLowerCase() !== 'span') {
    return `<p>${el.innerHTML}</p>`;
  }

  const p = document.createElement('p');

  const style = el.getAttribute('style');
  if (style && style.trim()) p.setAttribute('style', style);

  const cls = el.getAttribute('class');
  if (cls && cls.trim()) p.setAttribute('class', cls);

  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('data-')) {
      p.setAttribute(attr.name, attr.value);
    }
  }

  p.innerHTML = el.innerHTML;
  return p.outerHTML;
}

export const Editor = ({
  value,
  onChange,
  singleLine = false,
  element = 'div',
  onElementChange,
  languageCode,
}: Props) => {
  const [elementState, setElementState] = useState<SingleLineElement>(element);

  useEffect(() => {
    setElementState(element);
  }, [element]);

  const handleElementSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as SingleLineElement;
    setElementState(next);
    onElementChange?.(next);
  };

  // ✅ Slash Extension pro Editor-Instanz eindeutig
  const slashExtension = useMemo(() => {
    // singleLine hat kein Slash-Menü
    if (singleLine) return null;

    // stabiler key (pro mount + sprache)
    const key = `${languageCode ?? 'xx'}:${elementState}:${
      singleLine ? '1' : '0'
    }`;

    return createSlashCommandExtension({ key });
  }, [singleLine, languageCode, elementState]);

  const extensions = useMemo(() => {
    if (!singleLine) {
      // ✅ baseExtensions ist OHNE Slash -> wir fügen genau EINMAL hinzu
      return slashExtension
        ? [...baseExtensions, slashExtension]
        : [...baseExtensions];
    }

    // singleLine: DragHandle/Placeholder/Slash fliegt raus
    const base = filterOutByName(baseExtensions, [
      'dragHandle',
      'placeholder',
      'slashCommand',
    ]);

    return [...base, SingleLineExtension];
  }, [singleLine, slashExtension]);

  const editorContent = useMemo(() => {
    if (!singleLine) return value ?? '<p></p>';
    return toEditorContentFromStoredSingleLine(value);
  }, [singleLine, value]);

  const [charCount, setCharCount] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const editor = useEditor({
    extensions,
    content: editorContent,
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      const text = editor.state.doc.textBetween(
        0,
        editor.state.doc.content.size,
        '\n',
        '\n'
      );
      setCharCount(text.length);

      const selFrom = editor.state.selection.from;
      const before = editor.state.doc.textBetween(0, selFrom, '\n', '\n');
      setCursorPos(before.length);

      if (singleLine) onChange?.(toSpanHtmlFromEditorHtml(html));
      else onChange?.(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const selFrom = editor.state.selection.from;
      const before = editor.state.doc.textBetween(0, selFrom, '\n', '\n');
      setCursorPos(before.length);

      const text = editor.state.doc.textBetween(
        0,
        editor.state.doc.content.size,
        '\n',
        '\n'
      );
      setCharCount(text.length);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const text = editor.state.doc.textBetween(
      0,
      editor.state.doc.content.size,
      '\n',
      '\n'
    );
    setCharCount(text.length);

    const selFrom = editor.state.selection.from;
    const before = editor.state.doc.textBetween(0, selFrom, '\n', '\n');
    setCursorPos(before.length);
  }, [editor]);

  if (!editor) return null;

  const showCounter = !!languageCode;

  return (
    <Wrapper>
      <EditorSurface $singleLine={singleLine}>
        <BubbleMenu
          editor={editor}
          variant={singleLine ? 'singleLine' : 'full'}
        />
        <EditorContent editor={editor} />
      </EditorSurface>

      {(singleLine || showCounter) && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {singleLine ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Element</label>
              <select
                value={elementState}
                onChange={handleElementSelect}
                style={{
                  height: 32,
                  borderRadius: 999,
                  border: '1px solid #d1d5db',
                  padding: '0 10px',
                  fontSize: 12,
                  background: '#fff',
                }}
              >
                <option value="div">DIV</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          {showCounter && (
            <div
              style={{
                fontSize: 12,
                color: '#6b7280',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <span>
                {languageCode.toUpperCase()} · Zeichen: {cursorPos} /{' '}
                {charCount}
              </span>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default Editor;

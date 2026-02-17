'use client';

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';

import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

import { Extension } from '@tiptap/core';
import type { AnyExtension } from '@tiptap/core';

import {
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaBold,
  FaItalic,
  FaListOl,
  FaListUl,
  FaStrikethrough,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaSuperscript,
  FaSubscript,
  FaQuoteRight,
  FaLink,
  FaEraser,
  FaXmark,
  FaTable,
  FaFillDrip,
  FaA,
} from 'react-icons/fa6';

import SelectInput from '@/components/content-elements/default/inputs/select-input';
import { EMOJIS } from './emojis';
import { defaultFeatures, EditorFeature } from './defaultFeatures';
import {
  ColorIcon,
  ColorInput,
  EditorBody,
  EditorWrapper,
  EmojiGrid,
  EmojiItem,
  EmojiPopover,
  EmojiWrapper,
  Flex,
  HtmlEditorBody,
  HtmlTextarea,
  Modal,
  ModalActions,
  ModalBackdrop,
  ModalCheckboxRow,
  ModalField,
  ModalInput,
  ModalLabel,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalTitle,
  SelectWrapper,
  Separator,
  StyledEditorContent,
  TableCellMenuButton,
  TableCellMenuRow,
  TableCellMenuWrapper,
  TableGrid,
  TableGridCell,
  TableGridRow,
  TableHint,
  TableMainMenuButton,
  TableMainMenuItem,
  TableMainMenuWrapper,
  TablePopover,
  TablePopoverHeader,
  TableSelectionLabel,
  TableWrapper,
  Toolbar,
  ToolbarButton,
  ToolbarIconButton,
} from './RichTextEditor.styles';

import { fontSizeOptions } from './fontSizeOptions';
import { fontFamilyOptions } from './fontFamilyOptions';
import { lineHeightOptions } from './lineHeightOptions';
import { EditorFooter } from './editor-footer/EditorFooter';
import { blockOptions } from './blockOptions';

// ✅ FIX: keine Hooks dafür verwenden (sonst Hook-Order-Fehler wegen early return)
const fontSizeOptionsWithAuto = [
  { label: 'Auto', value: '' },
  ...fontSizeOptions,
];

const MIN_GRID_SIZE = 5;
const MAX_GRID_SIZE = 20;
const CELL_MENU_WIDTH = 212;
const CELL_MENU_HEIGHT_APPROX = 110;

const sanitizeSingleLineText = (text: string): string =>
  text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

/**
 * ✅ Single-line KERN-FIX:
 * ProseMirror braucht Top-Level-Blöcke.
 * Für multiline=false erzwingen wir: GENAU 1 Block (p ODER h1..h6), nie mehrere, nie extra leerer p.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enforceSingleBlock = (editor: any) => {
  const { state, view } = editor;
  const { doc, schema } = state;

  if (!doc) return;

  // Wenn schon genau 1 Top-Level-Node da ist, sind wir fertig.
  // (Auch wenn leer – dann ist es eben ein leerer Block, aber KEIN zusätzlicher Block.)
  if (doc.childCount === 1) return;

  // Nimm IMMER nur den ersten Block und schmeiß den Rest weg
  const first = doc.child(0);

  // Wenn der erste Node kein Textblock ist (sollte selten sein), fallback auf paragraph
  const firstIsHeading = first.type.name === 'heading';
  const firstIsParagraph = first.type.name === 'paragraph';

  const cleanNode = firstIsHeading
    ? schema.nodes.heading.create(first.attrs, first.content, first.marks)
    : firstIsParagraph
    ? schema.nodes.paragraph.create({}, first.content, first.marks)
    : schema.nodes.paragraph.create({}, first.content, first.marks);

  const newDoc = schema.topNodeType.create(null, cleanNode);

  // replaceWith braucht positions im Dokument:
  // 0..doc.content.size ersetzt kompletten Inhalt
  const tr = state.tr.replaceWith(0, doc.content.size, newDoc.content);

  view.dispatch(tr);
};

/**
 * Custom Extension: Schriftgröße über TextStyle (Inline, v.a. Paragraph/Text)
 */
const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              (element as HTMLElement).style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

/**
 * Custom Extension: Block-Font-Size für Heading (H1–H6) direkt am <hX> Tag.
 */
const HeadingFontSize = Extension.create({
  name: 'headingFontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              (element as HTMLElement).style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setHeadingFontSize:
        (fontSize: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain().updateAttributes('heading', { fontSize }).run(),
      unsetHeadingFontSize:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain().updateAttributes('heading', { fontSize: null }).run(),
    };
  },
});

/**
 * Custom Extension: Zeilenhöhe (line-height) auf Paragraph + Heading
 */
const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) =>
              (element as HTMLElement).style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain()
            .updateAttributes('paragraph', { lineHeight })
            .updateAttributes('heading', { lineHeight })
            .run(),
      unsetLineHeight:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ chain }: any) =>
          chain()
            .updateAttributes('paragraph', { lineHeight: null })
            .updateAttributes('heading', { lineHeight: null })
            .run(),
    };
  },
});

/**
 * TypeScript: Nur unsere eigenen Commands augmentieren
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    headingFontSize: {
      setHeadingFontSize: (fontSize: string) => ReturnType;
      unsetHeadingFontSize: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

type RichTextEditorProps = {
  value?: string; // HTML-String
  onChange?: (html: string) => void;
  className?: string;

  enabledFeatures?: EditorFeature[];

  /**
   * default: true
   * - true  => normaler RTE (mehrzeilig, Absätze erlaubt)
   * - false => single-line RTE (keine Absätze, Enter/Shift+Enter verboten,
   *            Paste wird auf eine Zeile normalisiert + nur EIN Block erlaubt)
   */
  multiline?: boolean;
};

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  className,
  enabledFeatures,
  multiline = true,
}) => {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [textColor, setTextColor] = useState('#111827');
  const [bgColor, setBgColor] = useState('');

  const [charCount, setCharCount] = useState<number>(0);

  // Editor-Modus: Rich-Text oder HTML
  const editorModeRef = useRef<'rich' | 'html'>('rich');
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');
  const [htmlValue, setHtmlValue] = useState<string>(value ?? '<p></p>');

  // Resizing
  const [editorHeight, setEditorHeight] = useState(220);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(220);

  const textColorInputRef = useRef<HTMLInputElement | null>(null);
  const bgColorInputRef = useRef<HTMLInputElement | null>(null);

  // Tabellen-Popup State
  const [isTablePopupOpen, setIsTablePopupOpen] = useState(false);
  const [tableRows, setTableRows] = useState(1);
  const [tableCols, setTableCols] = useState(1);
  const [gridRows, setGridRows] = useState(MIN_GRID_SIZE);
  const [gridCols, setGridCols] = useState(MIN_GRID_SIZE);
  const [activeGridRow, setActiveGridRow] = useState(0);
  const [activeGridCol, setActiveGridCol] = useState(0);
  const tableGridRef = useRef<HTMLDivElement | null>(null);

  // Kontext-Menü für Tabellenzelle
  const [cellMenuPos, setCellMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Button + Menü für "Tabelle löschen"
  const [tableMenuButtonPos, setTableMenuButtonPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isTableMainMenuOpen, setIsTableMainMenuOpen] = useState(false);

  const editorWrapperRef = useRef<HTMLDivElement | null>(null);

  const activeFeatures = useMemo(() => {
    const base = enabledFeatures ?? defaultFeatures;

    if (multiline) return base;

    const allowed = new Set<EditorFeature>([
      'bold',
      'italic',
      'underline',
      'strike',
      'text-color',
      'background-color',
      'align-left',
      'align-center',
      'align-right',
      'align-justify',
      'superscript',
      'subscript',
      'link',
      'emojis',
      'clear-formatting',
      'undo',
      'redo',

      // ✅ bleiben auch im single-line aktiv
      'block',
      'font-family',
      'font-size',
      'line-height',
    ]);

    return base.filter((f) => allowed.has(f));
  }, [enabledFeatures, multiline]);

  const isFeatureEnabled = (feature: EditorFeature): boolean =>
    activeFeatures.includes(feature);

  const extensions: AnyExtension[] = useMemo(() => {
    const base: AnyExtension[] = [
      StarterKit.configure({
        hardBreak: multiline ? {} : false,
        bulletList: multiline ? {} : false,
        orderedList: multiline ? {} : false,
        listItem: multiline ? {} : false,
        blockquote: multiline ? {} : false,
        heading: isFeatureEnabled('block') ? {} : false,
      }) as AnyExtension,

      Underline as AnyExtension,
      TextStyle as AnyExtension,
      Color.configure({ types: ['textStyle'] }) as AnyExtension,
      TextAlign.configure({
        types: isFeatureEnabled('block')
          ? ['heading', 'paragraph']
          : ['paragraph'],
      }) as AnyExtension,
      Superscript as AnyExtension,
      Subscript as AnyExtension,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }) as AnyExtension,
      FontFamily as AnyExtension,

      FontSize as AnyExtension,
      HeadingFontSize as AnyExtension,
      LineHeight as AnyExtension,

      Highlight.configure({ multicolor: true }) as AnyExtension,
    ];

    if (multiline && isFeatureEnabled('table')) {
      base.push(
        Table.configure({ resizable: false }) as AnyExtension,
        TableRow as AnyExtension,
        TableHeader as AnyExtension,
        TableCell as AnyExtension
      );
    }

    return base;
  }, [multiline, activeFeatures]);

  const editor = useEditor({
    extensions,
    content: value ?? '<p></p>',
    editorProps: {
      attributes: { class: 'tiptap-editor' },

      // Enter / Shift+Enter verhindern (single-line)
      handleKeyDown: (_view, event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
        return false;
      },

      transformPastedText: (text) => {
        if (multiline) return text;
        return sanitizeSingleLineText(text);
      },

      // ✅ Wir lassen HTML grundsätzlich durch – und erzwingen danach per enforceSingleBlock() genau einen Block.
      transformPastedHTML: (html) => {
        if (multiline) return html;
        return html;
      },
    },
    immediatelyRender: false,

    onUpdate({ editor }) {
      // ✅ Single-line: IMMER genau 1 Block erzwingen
      if (!multiline) {
        enforceSingleBlock(editor);
      }

      const html = editor.getHTML();

      if (editorModeRef.current === 'rich') {
        onChange?.(html);
        setCharCount(editor.getText().length);
        setHtmlValue(html);
      }
    },

    onSelectionUpdate({ editor }) {
      const textStyleAttrs = editor.getAttributes('textStyle') as {
        color?: string;
      };
      const highlightAttrs = editor.getAttributes('highlight') as {
        color?: string;
      };

      setTextColor(textStyleAttrs.color || '#111827');
      setBgColor(highlightAttrs.color || '');

      if (
        typeof window !== 'undefined' &&
        multiline &&
        isFeatureEnabled('table') &&
        editor.isActive('table')
      ) {
        const selection = window.getSelection();
        const wrapperRect = editorWrapperRef.current?.getBoundingClientRect();

        if (selection && selection.rangeCount > 0 && wrapperRect) {
          const wrapperLeft = wrapperRect.left;
          const wrapperTop = wrapperRect.top;

          const range = selection.getRangeAt(0);
          const node = range.startContainer;
          const element =
            node.nodeType === Node.ELEMENT_NODE
              ? (node as Element)
              : node.parentElement;

          const tableElement = element?.closest('table') as HTMLElement | null;
          if (tableElement) {
            const tableRect = tableElement.getBoundingClientRect();
            const btnTop = tableRect.top - wrapperTop - 18;
            const btnLeft = tableRect.right - wrapperLeft - 22;

            setTableMenuButtonPos({ top: Math.max(btnTop, 0), left: btnLeft });
          } else {
            setTableMenuButtonPos(null);
            setIsTableMainMenuOpen(false);
          }

          const cellElement = element?.closest('td, th') as HTMLElement | null;
          const rect = cellElement
            ? cellElement.getBoundingClientRect()
            : range.getBoundingClientRect();

          if (rect && (rect.width !== 0 || rect.height !== 0)) {
            const cellLeft = rect.left;
            const cellRight = rect.right;

            let colIndex = -1;
            let totalCols = 0;

            if (cellElement && cellElement.parentElement) {
              const rowElement = cellElement.parentElement;
              const cells = Array.from(
                rowElement.querySelectorAll('th,td')
              ) as HTMLElement[];
              totalCols = cells.length;
              colIndex = cells.indexOf(cellElement);
            }

            let left: number;

            if (totalCols > 0 && colIndex >= 0) {
              const half = Math.ceil(totalCols / 2);
              left =
                colIndex < half
                  ? cellLeft - wrapperLeft
                  : cellRight - wrapperLeft - CELL_MENU_WIDTH;
            } else {
              const cellCenterX = rect.left + rect.width / 2;
              left = cellCenterX - wrapperLeft - CELL_MENU_WIDTH / 2;
            }

            const viewportHeight = window.innerHeight;
            let top: number;

            if (rect.bottom + CELL_MENU_HEIGHT_APPROX + 8 <= viewportHeight) {
              top = rect.bottom - wrapperTop + 4;
            } else if (rect.top - CELL_MENU_HEIGHT_APPROX - 8 >= 0) {
              top = rect.top - wrapperTop - CELL_MENU_HEIGHT_APPROX - 4;
            } else {
              const fallbackTop =
                viewportHeight - CELL_MENU_HEIGHT_APPROX - 8 - wrapperTop;
              top = Math.max(8, fallbackTop);
            }

            setCellMenuPos({ top, left });
          } else {
            setCellMenuPos(null);
          }
        } else {
          setCellMenuPos(null);
          setTableMenuButtonPos(null);
          setIsTableMainMenuOpen(false);
        }
      } else {
        setCellMenuPos(null);
        setTableMenuButtonPos(null);
        setIsTableMainMenuOpen(false);
      }
    },
  });

  useEffect(() => {
    editorModeRef.current = editorMode;
  }, [editorMode]);

  useEffect(() => {
    if (!editor) return;
    if (typeof value !== 'string') return;

    editor.commands.setContent(value || '<p></p>', { emitUpdate: false });

    // ✅ Single-line auch bei externem value: auf exakt 1 Block reduzieren
    if (!multiline) {
      enforceSingleBlock(editor);
    }

    setCharCount(editor.getText().length);
    setHtmlValue(editor.getHTML());
  }, [value, editor, multiline]);

  useEffect(() => {
    if (!editor) return;
    setCharCount(editor.getText().length);
    setHtmlValue(editor.getHTML());
  }, [editor]);

  useEffect(() => {
    if (isTablePopupOpen && tableGridRef.current) {
      tableGridRef.current.focus();
    }
  }, [isTablePopupOpen]);

  if (!editor) {
    return (
      <EditorWrapper ref={editorWrapperRef} className={className}>
        Editor wird geladen…
      </EditorWrapper>
    );
  }

  const getCurrentHeadingValue = (): string => {
    if (!isFeatureEnabled('block')) return 'paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    if (editor.isActive('heading', { level: 5 })) return 'h5';
    if (editor.isActive('heading', { level: 6 })) return 'h6';
    return 'paragraph';
  };

  const headingValue = getCurrentHeadingValue();
  const isHeadingActive = headingValue !== 'paragraph';

  const fontFamilyValue =
    (editor.getAttributes('textStyle').fontFamily as string | undefined) ||
    "'Arial', sans-serif";

  const fontSizeValue = isHeadingActive
    ? (editor.getAttributes('heading').fontSize as string | undefined) ?? ''
    : (editor.getAttributes('textStyle').fontSize as string | undefined) ??
      '16px';

  const lineHeightValue =
    (editor.getAttributes('paragraph').lineHeight as string | undefined) ||
    (editor.getAttributes('heading').lineHeight as string | undefined) ||
    '1.5';

  const focusAllIfSingleLine = () => {
    if (multiline) return;
    const size = editor.state.doc.content.size;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: 1, to: Math.max(1, size) })
      .run();
  };

  const handleHeadingChange = (value: string) => {
    if (!isFeatureEnabled('block')) return;

    focusAllIfSingleLine();

    // Inline-FontSize entfernen, sonst überschreibt <span style="font-size"> Heading-CSS
    editor.chain().focus().unsetFontSize().run();

    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      if (!multiline) enforceSingleBlock(editor);
      return;
    }

    const levelMap: Record<
      'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
      1 | 2 | 3 | 4 | 5 | 6
    > = {
      h1: 1,
      h2: 2,
      h3: 3,
      h4: 4,
      h5: 5,
      h6: 6,
    };

    if ((value as keyof typeof levelMap) in levelMap) {
      const level = levelMap[value as keyof typeof levelMap];

      // ✅ SINGLE-LINE: NIEMALS togglen (das kann Blocks hinzufügen/wechseln)
      if (!multiline) {
        editor.chain().focus().setHeading({ level }).run();
        enforceSingleBlock(editor);
      } else {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    }
  };

  const handleFontFamilyChange = (value: string) => {
    if (!isFeatureEnabled('font-family')) return;

    focusAllIfSingleLine();

    if (!value) editor.chain().focus().unsetFontFamily().run();
    else editor.chain().focus().setFontFamily(value).run();

    if (!multiline) enforceSingleBlock(editor);
  };

  const handleFontSizeChange = (value: string) => {
    if (!isFeatureEnabled('font-size')) return;

    focusAllIfSingleLine();

    if (!value) {
      if (isHeadingActive) editor.chain().focus().unsetHeadingFontSize().run();
      else editor.chain().focus().unsetFontSize().run();

      if (!multiline) enforceSingleBlock(editor);
      return;
    }

    if (isHeadingActive) editor.chain().focus().setHeadingFontSize(value).run();
    else editor.chain().focus().setFontSize(value).run();

    if (!multiline) enforceSingleBlock(editor);
  };

  const handleLineHeightChange = (value: string) => {
    if (!isFeatureEnabled('line-height')) return;

    focusAllIfSingleLine();

    if (!value) editor.chain().focus().unsetLineHeight().run();
    else editor.chain().focus().setLineHeight(value).run();

    if (!multiline) enforceSingleBlock(editor);
  };

  const handleInsertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setIsEmojiOpen(false);
    if (!multiline) enforceSingleBlock(editor);
  };

  const openLinkModal = () => {
    const attrs = editor.getAttributes('link') as {
      href?: string;
      target?: string;
    };
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    setLinkUrl(attrs.href ?? '');
    setLinkText(selectedText);
    setOpenInNewTab(attrs.target === '_blank');
    setIsLinkModalOpen(true);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    if (!multiline) enforceSingleBlock(editor);
  };

  const handleLinkSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setIsLinkModalOpen(false);
      if (!multiline) enforceSingleBlock(editor);
      return;
    }

    const cleanUrl = linkUrl.trim();
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const text = (linkText || selectedText || cleanUrl).trim();

    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, text)
      .setTextSelection({ from, to: from + text.length })
      .setLink({
        href: cleanUrl,
        target: openInNewTab ? '_blank' : undefined,
        rel: openInNewTab ? 'noopener noreferrer' : undefined,
      })
      .run();

    setIsLinkModalOpen(false);
    if (!multiline) enforceSingleBlock(editor);
  };

  const handleLinkCancel = () => setIsLinkModalOpen(false);

  const clearFormatting = () => {
    focusAllIfSingleLine();
    editor.chain().focus().clearNodes().unsetAllMarks().setParagraph().run();
    if (!multiline) enforceSingleBlock(editor);
  };

  const createTable = (rows: number, cols: number) => {
    if (!multiline) return;
    if (rows < 1 || cols < 1) return;

    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setIsTablePopupOpen(false);
  };

  const resetTableGridState = () => {
    setGridRows(MIN_GRID_SIZE);
    setGridCols(MIN_GRID_SIZE);
    setActiveGridRow(0);
    setActiveGridCol(0);
    setTableRows(1);
    setTableCols(1);
  };

  const toggleTablePopup = () => {
    if (!multiline) return;
    if (!isTablePopupOpen) resetTableGridState();
    setIsTablePopupOpen((prev) => !prev);
  };

  const updateGridSize = (rowIndex: number, colIndex: number) => {
    setGridRows((prev) => {
      const needed = rowIndex + 1;
      let next = prev;
      if (needed >= prev - 1 && prev < MAX_GRID_SIZE)
        next = Math.min(MAX_GRID_SIZE, needed + 1);
      else if (needed < prev - 1 && prev > MIN_GRID_SIZE)
        next = Math.max(MIN_GRID_SIZE, needed + 1);
      return next;
    });

    setGridCols((prev) => {
      const needed = colIndex + 1;
      let next = prev;
      if (needed >= prev - 1 && prev < MAX_GRID_SIZE)
        next = Math.min(MAX_GRID_SIZE, needed + 1);
      else if (needed < prev - 1 && prev > MIN_GRID_SIZE)
        next = Math.max(MIN_GRID_SIZE, needed + 1);
      return next;
    });
  };

  const handleGridCellHover = (rowIndex: number, colIndex: number) => {
    setActiveGridRow(rowIndex);
    setActiveGridCol(colIndex);
    setTableRows(rowIndex + 1);
    setTableCols(colIndex + 1);
    updateGridSize(rowIndex, colIndex);
  };

  const handleGridCellClick = () => createTable(tableRows || 1, tableCols || 1);

  const handleTableGridKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!multiline) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsTablePopupOpen(false);
      return;
    }

    let nextRow = activeGridRow;
    let nextCol = activeGridCol;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextRow = Math.max(0, activeGridRow - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextRow = Math.min(MAX_GRID_SIZE - 1, activeGridRow + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nextCol = Math.max(0, activeGridCol - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextCol = Math.min(MAX_GRID_SIZE - 1, activeGridCol + 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      createTable(tableRows || 1, tableCols || 1);
      return;
    }

    if (nextRow !== activeGridRow || nextCol !== activeGridCol) {
      setActiveGridRow(nextRow);
      setActiveGridCol(nextCol);
      const rows = nextRow + 1;
      const cols = nextCol + 1;
      setTableRows(rows);
      setTableCols(cols);
      updateGridSize(nextRow, nextCol);
    }
  };

  const handleDeleteTable = () => {
    if (!multiline) return;
    editor.chain().focus().deleteTable().run();
    setIsTableMainMenuOpen(false);
    setTableMenuButtonPos(null);
  };

  const handleResizeMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    const diff = event.clientY - startYRef.current;
    const newHeight = Math.max(120, startHeightRef.current + diff);
    setEditorHeight(newHeight);
  };

  const handleResizeMouseUp = () => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  };

  const handleResizeMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    isResizingRef.current = true;
    startYRef.current = event.clientY;
    startHeightRef.current = editorHeight;

    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
  };

  const handleModeChange = (mode: 'rich' | 'html') => {
    if (mode === editorMode) return;
    if (mode === 'html' && !isFeatureEnabled('html-mode')) return;

    if (mode === 'html') {
      const currentHtml = editor.getHTML();
      setHtmlValue(currentHtml);
      setCharCount(currentHtml.length);
    } else {
      const safeHtml =
        htmlValue && htmlValue.trim().length > 0 ? htmlValue : '<p></p>';

      editor.commands.setContent(safeHtml, { emitUpdate: false });
      if (!multiline) enforceSingleBlock(editor);

      setCharCount(editor.getText().length);
      onChange?.(editor.getHTML());
    }

    setEditorMode(mode);
  };

  const showCellMenu =
    !!cellMenuPos &&
    !isTablePopupOpen &&
    editorMode === 'rich' &&
    multiline &&
    isFeatureEnabled('table');

  const canMergeCells = multiline ? editor.can().mergeCells() : false;
  const canSplitCell = multiline ? editor.can().splitCell() : false;

  const displayCharCount = editorMode === 'html' ? htmlValue.length : charCount;

  const showBold = isFeatureEnabled('bold');
  const showItalic = isFeatureEnabled('italic');
  const showUnderline = isFeatureEnabled('underline');
  const showStrike = isFeatureEnabled('strike');

  const showTextColor = isFeatureEnabled('text-color');
  const showBgColor = isFeatureEnabled('background-color');

  const showBlock = isFeatureEnabled('block');
  const showFontFamily = isFeatureEnabled('font-family');
  const showFontSize = isFeatureEnabled('font-size');
  const showLineHeight = isFeatureEnabled('line-height');

  const showAlignLeft = isFeatureEnabled('align-left');
  const showAlignCenter = isFeatureEnabled('align-center');
  const showAlignRight = isFeatureEnabled('align-right');
  const showAlignJustify = isFeatureEnabled('align-justify');

  const showBulletList = multiline && isFeatureEnabled('bullet-list');
  const showOrderedList = multiline && isFeatureEnabled('ordered-list');
  const showBlockquote = multiline && isFeatureEnabled('blockquote');

  const showSuperscript = isFeatureEnabled('superscript');
  const showSubscript = isFeatureEnabled('subscript');

  const showEmojis = isFeatureEnabled('emojis');
  const showLink = isFeatureEnabled('link');

  const showTable = multiline && isFeatureEnabled('table');

  const showClearFormatting = isFeatureEnabled('clear-formatting');
  const showUndo = isFeatureEnabled('undo');
  const showRedo = isFeatureEnabled('redo');

  const showHtmlModeToggle = isFeatureEnabled('html-mode');

  const showBasicGroup = showBold || showItalic || showUnderline || showStrike;
  const showColorGroup = showTextColor || showBgColor;
  const showBlockGroup =
    showBlock || showFontFamily || showFontSize || showLineHeight;
  const showAlignGroup =
    showAlignLeft || showAlignCenter || showAlignRight || showAlignJustify;
  const showListGroup = showBulletList || showOrderedList;
  const showQuoteGroup = showBlockquote;
  const showScriptGroup = showSuperscript || showSubscript;
  const showEmojiGroup = showEmojis;
  const showLinkGroup = showLink;
  const showTableGroup = showTable;
  const showClearGroup = showClearFormatting;
  const showHistoryGroup = showUndo || showRedo;

  const somethingAfterBasic =
    showColorGroup ||
    showBlockGroup ||
    showAlignGroup ||
    showListGroup ||
    showQuoteGroup ||
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterColor =
    showBlockGroup ||
    showAlignGroup ||
    showListGroup ||
    showQuoteGroup ||
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterBlock =
    showAlignGroup ||
    showListGroup ||
    showQuoteGroup ||
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterAlign =
    showListGroup ||
    showQuoteGroup ||
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterList =
    showQuoteGroup ||
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterQuote =
    showScriptGroup ||
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;

  const somethingAfterScript =
    showEmojiGroup ||
    showLinkGroup ||
    showTableGroup ||
    showClearGroup ||
    showHistoryGroup;
  const somethingAfterEmoji =
    showLinkGroup || showTableGroup || showClearGroup || showHistoryGroup;
  const somethingAfterLink =
    showTableGroup || showClearGroup || showHistoryGroup;
  const somethingAfterTable = showClearGroup || showHistoryGroup;
  const somethingAfterClear = showHistoryGroup;

  const toolbarButtonsDisabled = editorMode === 'html';

  return (
    <EditorWrapper
      ref={editorWrapperRef}
      className={className}
      data-multiline={multiline ? 'true' : 'false'}
    >
      <Toolbar>
        {/* Grundformatierungen */}
        {showBasicGroup && (
          <>
            {showBold && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaBold />
              </ToolbarButton>
            )}
            {showItalic && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaItalic />
              </ToolbarButton>
            )}
            {showUnderline && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaUnderline />
              </ToolbarButton>
            )}
            {showStrike && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaStrikethrough />
              </ToolbarButton>
            )}
            {somethingAfterBasic && <Separator />}
          </>
        )}

        {/* Schrift- & Hintergrundfarbe */}
        {showColorGroup && (
          <>
            {showTextColor && (
              <>
                <ColorIcon
                  $color={textColor}
                  title="Schriftfarbe"
                  $active={editor.isActive('textStyle')}
                  onClick={() =>
                    !toolbarButtonsDisabled &&
                    textColorInputRef.current?.click()
                  }
                >
                  <FaA />
                </ColorIcon>
                <ColorInput
                  ref={textColorInputRef}
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTextColor(v);
                    editor.chain().focus().setColor(v).run();
                    if (!multiline) enforceSingleBlock(editor);
                  }}
                />
              </>
            )}

            {showBgColor && (
              <>
                <ColorIcon
                  $color={bgColor || 'transparent'}
                  title="Hintergrundfarbe"
                  onClick={() =>
                    !toolbarButtonsDisabled && bgColorInputRef.current?.click()
                  }
                >
                  <FaFillDrip />
                </ColorIcon>
                <ColorInput
                  ref={bgColorInputRef}
                  type="color"
                  value={bgColor || '#ffffff'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBgColor(v);
                    editor.chain().focus().setHighlight({ color: v }).run();
                    if (!multiline) enforceSingleBlock(editor);
                  }}
                />
              </>
            )}

            {somethingAfterColor && <Separator />}
          </>
        )}

        {/* Block-Typ / Font / Size / Line-Height */}
        <Flex>
          {showBlockGroup && (
            <>
              {showBlock && (
                <SelectWrapper>
                  <SelectInput
                    label="Block"
                    name="block"
                    value={headingValue}
                    onChange={(e) => handleHeadingChange(e.target.value)}
                    options={blockOptions}
                    backgroundColor="#f9fafb"
                    disabled={toolbarButtonsDisabled}
                    size="small"
                  />
                </SelectWrapper>
              )}

              {showFontFamily && (
                <SelectWrapper $width={100}>
                  <SelectInput
                    label="Schrift"
                    name="fontFamily"
                    value={fontFamilyValue}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    options={fontFamilyOptions}
                    backgroundColor="#f9fafb"
                    disabled={toolbarButtonsDisabled}
                    size="small"
                  />
                </SelectWrapper>
              )}

              {showFontSize && (
                <SelectWrapper>
                  <SelectInput
                    label="Größe"
                    name="fontSize"
                    value={fontSizeValue}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                    options={fontSizeOptionsWithAuto}
                    backgroundColor="#f9fafb"
                    disabled={toolbarButtonsDisabled}
                    size="small"
                  />
                </SelectWrapper>
              )}

              {showLineHeight && (
                <SelectWrapper>
                  <SelectInput
                    label="Zeilen"
                    name="lineHeight"
                    value={lineHeightValue}
                    onChange={(e) => handleLineHeightChange(e.target.value)}
                    options={lineHeightOptions}
                    backgroundColor="#f9fafb"
                    disabled={toolbarButtonsDisabled}
                    size="small"
                  />
                </SelectWrapper>
              )}

              {somethingAfterBlock && <Separator />}
            </>
          )}
        </Flex>

        {/* Ausrichtung */}
        {showAlignGroup && (
          <>
            {showAlignLeft && (
              <ToolbarButton
                type="button"
                title="Links ausrichten"
                $active={editor.isActive({ textAlign: 'left' })}
                onClick={() =>
                  editor.chain().focus().setTextAlign('left').run()
                }
                disabled={toolbarButtonsDisabled}
              >
                <FaAlignLeft />
              </ToolbarButton>
            )}
            {showAlignCenter && (
              <ToolbarButton
                type="button"
                title="Zentriert"
                $active={editor.isActive({ textAlign: 'center' })}
                onClick={() =>
                  editor.chain().focus().setTextAlign('center').run()
                }
                disabled={toolbarButtonsDisabled}
              >
                <FaAlignCenter />
              </ToolbarButton>
            )}
            {showAlignRight && (
              <ToolbarButton
                type="button"
                title="Rechts ausrichten"
                $active={editor.isActive({ textAlign: 'right' })}
                onClick={() =>
                  editor.chain().focus().setTextAlign('right').run()
                }
                disabled={toolbarButtonsDisabled}
              >
                <FaAlignRight />
              </ToolbarButton>
            )}
            {showAlignJustify && (
              <ToolbarButton
                type="button"
                title="Blocksatz"
                $active={editor.isActive({ textAlign: 'justify' })}
                onClick={() =>
                  editor.chain().focus().setTextAlign('justify').run()
                }
                disabled={toolbarButtonsDisabled}
              >
                <FaAlignJustify />
              </ToolbarButton>
            )}
            {somethingAfterAlign && <Separator />}
          </>
        )}

        {/* Listen */}
        {showListGroup && (
          <>
            {showBulletList && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('bulletList')}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaListUl />
              </ToolbarButton>
            )}
            {showOrderedList && (
              <ToolbarButton
                type="button"
                $active={editor.isActive('orderedList')}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaListOl />
              </ToolbarButton>
            )}
            {somethingAfterList && <Separator />}
          </>
        )}

        {/* Blockquote */}
        {showQuoteGroup && (
          <>
            <ToolbarButton
              type="button"
              title="Blockquote"
              $active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={toolbarButtonsDisabled}
            >
              <FaQuoteRight />
            </ToolbarButton>
            {somethingAfterQuote && <Separator />}
          </>
        )}

        {/* Hochgestellt / Tiefgestellt */}
        {showScriptGroup && (
          <>
            {showSuperscript && (
              <ToolbarButton
                type="button"
                title="Hochgestellt"
                $active={editor.isActive('superscript')}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaSuperscript />
              </ToolbarButton>
            )}
            {showSubscript && (
              <ToolbarButton
                type="button"
                title="Tiefgestellt"
                $active={editor.isActive('subscript')}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaSubscript />
              </ToolbarButton>
            )}
            {somethingAfterScript && <Separator />}
          </>
        )}

        {/* Emoji-Picker */}
        {showEmojiGroup && (
          <>
            <EmojiWrapper>
              <ToolbarButton
                type="button"
                title="Emoji einfügen"
                onClick={() =>
                  !toolbarButtonsDisabled && setIsEmojiOpen((prev) => !prev)
                }
                disabled={toolbarButtonsDisabled}
              >
                😊
              </ToolbarButton>
              {isEmojiOpen && editorMode === 'rich' && (
                <EmojiPopover>
                  <EmojiGrid>
                    {EMOJIS.map((emoji) => (
                      <EmojiItem
                        key={emoji}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                      >
                        {emoji}
                      </EmojiItem>
                    ))}
                  </EmojiGrid>
                </EmojiPopover>
              )}
            </EmojiWrapper>
            {somethingAfterEmoji && <Separator />}
          </>
        )}

        {/* Link */}
        {showLinkGroup && (
          <>
            <ToolbarButton
              type="button"
              title="Link setzen / bearbeiten"
              $active={editor.isActive('link')}
              onClick={openLinkModal}
              disabled={toolbarButtonsDisabled}
            >
              <FaLink />
            </ToolbarButton>
            <ToolbarButton
              type="button"
              title="Link entfernen"
              onClick={removeLink}
              disabled={toolbarButtonsDisabled}
            >
              <FaXmark />
            </ToolbarButton>
            {somethingAfterLink && <Separator />}
          </>
        )}

        {/* Tabelle */}
        {showTableGroup && (
          <>
            <TableWrapper>
              <ToolbarButton
                type="button"
                title="Tabelle einfügen"
                onClick={toggleTablePopup}
                disabled={toolbarButtonsDisabled}
              >
                <FaTable />
              </ToolbarButton>

              {isTablePopupOpen && editorMode === 'rich' && (
                <TablePopover role="dialog" aria-label="Tabelle einfügen">
                  <TablePopoverHeader>
                    <TableSelectionLabel>
                      {tableRows > 0 && tableCols > 0
                        ? `${tableRows} × ${tableCols} Zellen`
                        : 'Tabelle wählen'}
                    </TableSelectionLabel>
                    <ToolbarIconButton
                      type="button"
                      title="Popup schließen"
                      onClick={() => setIsTablePopupOpen(false)}
                    >
                      <FaXmark />
                    </ToolbarIconButton>
                  </TablePopoverHeader>

                  <TableGrid
                    ref={tableGridRef}
                    tabIndex={0}
                    onKeyDown={handleTableGridKeyDown}
                  >
                    {Array.from({ length: gridRows }).map((_, rowIndex) => (
                      <TableGridRow key={rowIndex}>
                        {Array.from({ length: gridCols }).map((_, colIndex) => {
                          const selected =
                            rowIndex <= activeGridRow &&
                            colIndex <= activeGridCol;
                          return (
                            <TableGridCell
                              key={colIndex}
                              type="button"
                              $selected={selected}
                              onMouseEnter={() =>
                                handleGridCellHover(rowIndex, colIndex)
                              }
                              onClick={handleGridCellClick}
                            />
                          );
                        })}
                      </TableGridRow>
                    ))}
                  </TableGrid>

                  <TableHint>
                    Pfeiltasten zum Auswählen, Enter zum Einfügen, Esc zum
                    Schließen
                  </TableHint>
                </TablePopover>
              )}
            </TableWrapper>
            {somethingAfterTable && <Separator />}
          </>
        )}

        {/* Formatierungen löschen */}
        {showClearGroup && (
          <>
            <ToolbarButton
              type="button"
              title="Alle Formatierungen löschen"
              onClick={clearFormatting}
              disabled={toolbarButtonsDisabled}
            >
              <FaEraser />
            </ToolbarButton>
            {somethingAfterClear && <Separator />}
          </>
        )}

        {/* Undo / Redo */}
        {showHistoryGroup && (
          <>
            {showUndo && (
              <ToolbarButton
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaArrowRotateLeft />
              </ToolbarButton>
            )}
            {showRedo && (
              <ToolbarButton
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={toolbarButtonsDisabled}
              >
                <FaArrowRotateRight />
              </ToolbarButton>
            )}
          </>
        )}
      </Toolbar>

      {/* Link-Modal */}
      {isLinkModalOpen && showLink && (
        <ModalBackdrop>
          <Modal>
            <ModalTitle>Link einfügen / bearbeiten</ModalTitle>
            <form onSubmit={handleLinkSubmit}>
              <ModalField>
                <ModalLabel>URL</ModalLabel>
                <ModalInput
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                />
              </ModalField>
              <ModalField>
                <ModalLabel>Linktext</ModalLabel>
                <ModalInput
                  type="text"
                  placeholder="Angezeigter Text (optional)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </ModalField>
              <ModalCheckboxRow>
                <label>
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                  />
                  <span>In neuem Tab öffnen</span>
                </label>
              </ModalCheckboxRow>
              <ModalActions>
                <ModalSecondaryButton type="button" onClick={handleLinkCancel}>
                  Abbrechen
                </ModalSecondaryButton>
                <ModalPrimaryButton type="submit">Speichern</ModalPrimaryButton>
              </ModalActions>
            </form>
          </Modal>
        </ModalBackdrop>
      )}

      {/* Tabellen-Cell-Menü */}
      {showCellMenu && cellMenuPos && (
        <TableCellMenuWrapper
          $top={cellMenuPos.top}
          $left={cellMenuPos.left}
          $width={CELL_MENU_WIDTH}
        >
          <TableCellMenuRow>
            <TableCellMenuButton
              type="button"
              title="Spalte links einfügen"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M5,1v5h3v5H5v4h10V1H5z M8,14H6v-2h2V14z M8,5H6V3h2V5z M14,14h-2v-2h2V14z M14,11h-2V9h2V11z M14,8h-2V6h2V8z M14,5h-2V3h2V5z"></path>
                <path d="M3,9l1,1H2.5L1,8.5L2.5,7H4L3,8h4v1H3z"></path>
              </svg>
            </TableCellMenuButton>

            <TableCellMenuButton
              type="button"
              title="Spalte rechts einfügen"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M11,1H1v14h10v-4H9.6H8v-1V7V6h1.6H11V1z M4,14H2v-2h2V14z M4,11H2V9h2V11z M4,8H2V6h2V8z M4,5H2V3h2V5z M10,12v2H8v-2H10z M10,5H8V3h2V5z"></path>
                <path d="M15,8.5L13.5,10H12l1-1H9V8h4l-1-1h1.5L15,8.5z"></path>
              </svg>
            </TableCellMenuButton>

            <TableCellMenuButton
              type="button"
              title="Zeile oberhalb einfügen"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M11,4v4H6V4H2v11h13V4H11z M5,14H3v-2h2V14z M5,8H3V6h2V8z M8,14H6v-2h2V14z M11,14H9v-2h2V14z M14,14h-2v-2h2V14z M14,8h-2V6h2V8z"></path>
                <path d="M8,3L7,4V2.5L8.5,1L10,2.5V4L9,3v4H8V3z"></path>
              </svg>
            </TableCellMenuButton>

            <TableCellMenuButton
              type="button"
              title="Zeile unterhalb einfügen"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M2,1v11h4V9h1V8h3v1h1v3h4V1H2z M5,11H3V9h2V11z M5,5H3V3h2V5z M8,5H6V3h2V5z M11,5H9V3h2V5z M14,11h-2V9h2V11z M14,5h-2V3h2V5z"></path>
                <path d="M9,13l1-1v1.5L8.5,15L7,13.5V12l1,1V9h1V13z"></path>
              </svg>
            </TableCellMenuButton>

            <TableCellMenuButton
              type="button"
              title="Spalte löschen"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M2,1v6h4v0.6l1,1V2h3v8H8.4l0.1,0.1L7.5,11H11V7h4V1H2z M6,6H3V2h3V6z M14,6h-3V2h3V6z"></path>
                <path d="M5,12l2,2l-1.1,1.1l-2-2l-2,2L0.9,14l2-2l-2-2L2,9l2,2l2-2L7,10.1L5,12z"></path>
              </svg>
            </TableCellMenuButton>

            <TableCellMenuButton
              type="button"
              title="Zeile löschen"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <svg viewBox="-2 -2 20 20">
                <path d="M10,8.5V10H2V7h6.5l-1-1H7V2H1v13h6v-4h4V7.5L10,8.5z M2,3h4v3H2V3z M6,14H2v-3h4V14z"></path>
                <path d="M13,4l2,2l-1.1,1.1l-2-2l-2,2L8.9,6l2-2l-2-2L10,1l2,2l2-2L15,2.1C15,2.1,13,4,13,4z"></path>
              </svg>
            </TableCellMenuButton>

            {canMergeCells && (
              <TableCellMenuButton
                type="button"
                title="Zellen verbinden"
                onClick={() => editor.chain().focus().mergeCells().run()}
              >
                <svg viewBox="-2 -2 20 20">
                  <path d="M15,11.1c-0.1-0.1-0.3-0.1-0.4,0l-2.1,2.4l-2.1-2.4c-0.1-0.1-0.3-0.1-0.4,0c-0.1,0.1-0.1,0.4,0,0.5l2.3,2.7l0,0l0,0c0.1,0.1,0.2,0.1,0.3,0.1c0,0,0.1,0,0.1-0.1l2.3-2.7C15.2,11.5,15.2,11.3,15,11.1z"></path>
                  <path d="M12.4,1.6H3c-0.5,0-0.8,0.4-0.8,1v10.9c0,0.5,0.4,1,0.8,1h7.3l0,0c0.2,0,0.3-0.1,0.3-0.3c0-0.2-0.1-0.3-0.3-0.3l0,0H5.7V5.1h6.9v5.6c0,0.2,0.1,0.3,0.3,0.3c0.2,0,0.3-0.1,0.3-0.3V2.5C13.2,2,12.8,1.6,12.4,1.6z M5.2,13.7H3c-0.2,0-0.3-0.1-0.3-0.3v-1.9h2.5V13.7z M5.2,10.9H2.7V8.3h2.5V10.9z M5.2,7.7H2.7V5.1h2.5V7.7z M5.2,4.5H2.7V2.5c0-0.2,0.1-0.3,0.3-0.3h2.2V4.5z M9.1,4.5H5.7V2.2h3.3L9.1,4.5L9.1,4.5z M12.7,4.5h-3V2.2h2.8c0.2,0,0.3,0.1,0.3,0.3V4.5z"></path>
                </svg>
              </TableCellMenuButton>
            )}

            {canSplitCell && (
              <TableCellMenuButton
                type="button"
                title="Zelle teilen"
                onClick={() => editor.chain().focus().splitCell().run()}
              >
                <svg viewBox="-2 -2 20 20">
                  <path d="M7.6,14V2h0.8v12H7.6z M2.4,11.7v0.8h3.8v-9H2.4v0.8h3v7.5H2.4z M13.6,4.2V3.5H9.9v9h3.8v-0.8h-3V4.2L13.6,4.2L13.6,4.2z"></path>
                </svg>
              </TableCellMenuButton>
            )}
          </TableCellMenuRow>
        </TableCellMenuWrapper>
      )}

      {/* Tabellen-Main-Menü (Tabelle löschen) */}
      {multiline &&
        isFeatureEnabled('table') &&
        tableMenuButtonPos &&
        editorMode === 'rich' && (
          <>
            <TableMainMenuButton
              type="button"
              style={{
                top: tableMenuButtonPos.top,
                left: tableMenuButtonPos.left,
              }}
              title="Tabellenmenü"
              onClick={() => setIsTableMainMenuOpen((prev) => !prev)}
            >
              ⋮
            </TableMainMenuButton>

            {isTableMainMenuOpen && (
              <TableMainMenuWrapper
                style={{ top: tableMenuButtonPos.top + 28, right: 24 }}
              >
                <TableMainMenuItem
                  type="button"
                  title="Tabelle löschen"
                  onClick={handleDeleteTable}
                >
                  <svg viewBox="-2 -2 20 20">
                    <path d="M9.4,3H7.5l-1,1l2,2H10v2H7V7.4L5.9,8.5L5.5,8H3V7.5l-1,1V15h13V3H9.4z M6,14H3v-2h3V14z M6,11H3V9 h3V11z M10,14H7v-2h3V14z M10,11H7V9h3V11z M14,14h-3v-2h3V14z M14,11h-3V9h3V11z M14,7.8V8h-3V6h3V7.8z"></path>
                    <path d="M5,4l2,2L5.9,7.1l-2-2l-2,2L0.9,6l2-2l-2-2L2,1l2,2l2-2L7,2.1L5,4z"></path>
                  </svg>
                </TableMainMenuItem>
              </TableMainMenuWrapper>
            )}
          </>
        )}

      {/* Body: je nach Modus */}
      {editorMode === 'rich' ? (
        <EditorBody $height={multiline ? editorHeight : 56}>
          <StyledEditorContent editor={editor} />
        </EditorBody>
      ) : (
        <HtmlEditorBody $height={editorHeight}>
          <HtmlTextarea
            value={htmlValue}
            onChange={(e) => {
              const val = e.target.value;
              setHtmlValue(val);
              onChange?.(val);
              setCharCount(val.length);
            }}
          />
        </HtmlEditorBody>
      )}

      <EditorFooter
        displayCharCount={displayCharCount}
        handleResizeMouseDown={handleResizeMouseDown}
        showHtmlModeToggle={showHtmlModeToggle}
        editorMode={editorMode}
        handleModeChange={handleModeChange}
      />
    </EditorWrapper>
  );
};

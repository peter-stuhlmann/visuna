'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import type { Selection } from '@tiptap/pm/state';
import { createPortal } from 'react-dom';

import { HexColorPicker } from 'react-colorful';
import 'tippy.js/dist/tippy.css';

import {
  Bubble,
  BubbleButton,
  BubbleDivider,
  BubbleGroup,
  Dropdown,
  DropdownItem,
  DropdownPanel,
  FormRow,
  Label,
  Input,
  CheckboxRow,
  ButtonRow,
  SmallButton,
  EmojiGrid,
  EmojiButton,
} from './styles';
import { EMOJIS } from './emojis';

// optional
import { dragHandlePluginKey } from './DragHandleExtension';

type Props = {
  editor: Editor;
  variant?: 'full' | 'singleLine';
};

const headingLevels = [1, 2, 3, 4, 5, 6] as const;

const PRESET_COLORS = [
  '#111827',
  '#6B7280',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#A855F7',
  'transparent',
];

// --- Hex helpers ---
function normalizeHex(input: string): string {
  let v = input.trim();
  if (!v) return '#';
  if (!v.startsWith('#')) v = `#${v}`;
  v = `#${v
    .slice(1)
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 6)}`;
  return v;
}
function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function preventEditorBlurOnMouseDown(e: React.MouseEvent) {
  const el = e.target as HTMLElement | null;
  if (!el) return;

  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (el.closest('[data-allow-focus="true"]')) return;

  e.preventDefault();
}

type PopoverKind = 'text' | 'highlight';

function useAnchorRect(
  open: boolean,
  anchorEl: HTMLElement | null
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    setRect(r);
  }, [anchorEl]);

  useEffect(() => {
    if (!open || !anchorEl) return;
    update();

    const onScroll = () => update();
    const onResize = () => update();

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, anchorEl, update]);

  return rect;
}

export const BubbleMenu = ({ editor, variant = 'full' }: Props) => {
  const isSingleLine = variant === 'singleLine';

  // ---------- Panels ----------
  const [openBlock, setOpenBlock] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);

  // ✅ Color popovers (Portal)
  const [colorPopover, setColorPopover] = useState<PopoverKind | null>(null);

  // Buttons refs (Anchor)
  const textColorBtnRef = useRef<HTMLButtonElement | null>(null);
  const highlightBtnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ Popover root ref (portal content)
  const colorPopoverRootRef = useRef<HTMLDivElement | null>(null);

  // ✅ während Drag im Picker: NICHT schließen
  const isDraggingColorRef = useRef(false);

  const textRect = useAnchorRect(
    colorPopover === 'text',
    textColorBtnRef.current
  );
  const highlightRect = useAnchorRect(
    colorPopover === 'highlight',
    highlightBtnRef.current
  );

  const anyPanelOpen =
    openBlock || openList || openLink || openEmoji || colorPopover != null;

  // ---------- Link ----------
  const [linkUrl, setLinkUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // ---------- Selection freeze (wichtig für Farben ohne focus()) ----------
  const frozenSelectionRef = useRef<Selection | null>(null);

  const freezeSelection = useCallback(() => {
    frozenSelectionRef.current = editor.state.selection;
  }, [editor]);

  const restoreFrozenSelectionIfNeeded = useCallback(() => {
    const sel = frozenSelectionRef.current;
    if (!sel) return;
    try {
      const tr = editor.state.tr.setSelection(sel);
      editor.view.dispatch(tr);
    } catch {
      // ignore
    }
  }, [editor]);

  // ---------- Colors ----------
  const currentTextColor =
    (editor.getAttributes('textStyle')?.color as string | undefined) ??
    '#111827';

  const currentHighlight =
    (editor.getAttributes('highlight')?.color as string | undefined) ?? '';

  const [textHexInput, setTextHexInput] = useState(currentTextColor);
  const [highlightHexInput, setHighlightHexInput] = useState(
    currentHighlight || '#fff59d'
  );

  useEffect(() => setTextHexInput(currentTextColor), [currentTextColor]);
  useEffect(
    () => setHighlightHexInput(currentHighlight || '#fff59d'),
    [currentHighlight]
  );

  // ✅ WICHTIG: KEIN chain(), KEIN focus() (sonst Selection/Focus-Flackern)
  const setTextColor = (color: string) => {
    restoreFrozenSelectionIfNeeded();
    editor.commands.setColor(color);
  };

  const unsetTextColor = () => {
    restoreFrozenSelectionIfNeeded();
    editor.commands.unsetColor();
  };

  const setHighlightColor = (color: string) => {
    restoreFrozenSelectionIfNeeded();
    editor.commands.setHighlight({ color });
  };

  const unsetHighlight = () => {
    restoreFrozenSelectionIfNeeded();
    editor.commands.unsetHighlight();
  };

  // ---------- Close helpers ----------
  const closeAll = useCallback(() => {
    setOpenBlock(false);
    setOpenList(false);
    setOpenLink(false);
    setOpenEmoji(false);
    setColorPopover(null);
  }, []);

  /**
   * ✅ Portal outside click: schließt NUR den Popover
   * - nutzt composedPath() (portal-safe)
   * - ignoriert während Drag im Picker
   */
  useEffect(() => {
    if (!colorPopover) return;

    const onPointerDown = (e: PointerEvent) => {
      if (isDraggingColorRef.current) return;

      const popoverRoot =
        colorPopoverRootRef.current ??
        (document.querySelector(
          '[data-color-popover="true"]'
        ) as HTMLElement | null);

      if (!popoverRoot) return;

      const textTrigger = textColorBtnRef.current;
      const highlightTrigger = highlightBtnRef.current;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const path = (e as any).composedPath?.() as EventTarget[] | undefined;

      if (path) {
        if (path.includes(popoverRoot)) return;
        if (
          colorPopover === 'text' &&
          textTrigger &&
          path.includes(textTrigger)
        )
          return;
        if (
          colorPopover === 'highlight' &&
          highlightTrigger &&
          path.includes(highlightTrigger)
        )
          return;

        setColorPopover(null);
        return;
      }

      const target = e.target;
      if (!(target instanceof Element)) return;

      if (popoverRoot.contains(target)) return;
      if (colorPopover === 'text' && textTrigger?.contains(target)) return;
      if (colorPopover === 'highlight' && highlightTrigger?.contains(target))
        return;

      setColorPopover(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setColorPopover(null);
    };

    window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown, false);
    }, 0);

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, false);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [colorPopover]);

  // ✅ Drag-Guard: wenn Pointer irgendwo losgelassen wird, Drag=false
  useEffect(() => {
    const up = () => {
      isDraggingColorRef.current = false;
    };
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    return () => {
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
    };
  }, []);

  // ---------- Block helpers (FULL) ----------
  const currentBlockLabel = useMemo(() => {
    if (editor.isActive('codeBlock')) return 'Code (Block)';
    for (const level of headingLevels) {
      if (editor.isActive('heading', { level })) return `H${level}`;
    }
    return 'Text';
  }, [editor]);

  const setParagraph = () => {
    editor.chain().focus().setParagraph().run();
    setOpenBlock(false);
  };

  const setHeading = (level: (typeof headingLevels)[number]) => {
    if (editor.isActive('heading', { level }))
      editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setNode('heading', { level }).run();
    setOpenBlock(false);
  };

  const toggleCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
    setOpenBlock(false);
  };

  const toggleBlockquote = () =>
    editor.chain().focus().toggleBlockquote().run();

  // ---------- List helpers (FULL) ----------
  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
    setOpenList(false);
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
    setOpenList(false);
  };

  // ---------- Alignment ----------
  const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const alignActive = (align: 'left' | 'center' | 'right' | 'justify') =>
    editor.isActive({ textAlign: align });

  // ---------- Link helpers ----------
  const openLinkPanel = () => {
    setOpenBlock(false);
    setOpenList(false);
    setOpenEmoji(false);
    setColorPopover(null);

    const attrs = editor.getAttributes('link') as {
      href?: string;
      target?: string;
    };
    setLinkUrl(attrs.href ?? '');
    setOpenInNewTab((attrs.target ?? '') === '_blank');
    setOpenLink((v) => !v);
  };

  const applyLink = () => {
    const url = linkUrl.trim();

    if (!url) {
      if (editor.isActive('link'))
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setOpenLink(false);
      return;
    }

    const isSelectionEmpty = editor.state.selection.empty;
    if (isSelectionEmpty && !editor.isActive('link')) return;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
        target: openInNewTab ? '_blank' : null,
        rel: openInNewTab ? 'noopener noreferrer' : null,
      })
      .run();

    setOpenLink(false);
  };

  const removeLink = () => {
    if (!editor.isActive('link')) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpenLink(false);
  };

  // ---------- History ----------
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();
  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().setParagraph().run();
  };

  // ---------- Sup/Sub (FULL) ----------
  const toggleSup = () => editor.chain().focus().toggleSuperscript().run();
  const toggleSub = () => editor.chain().focus().toggleSubscript().run();

  // ---------- Emoji (FULL) ----------
  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setOpenEmoji(false);
  };

  // ---------- Context: Table controls ----------
  const isInTable = editor.isActive('table');
  const renderTableControls = () => {
    if (isSingleLine) return null;
    if (!isInTable) return null;

    const can = editor.can();

    const btn = (label: string, title: string, ok: boolean, run: () => void) =>
      ok ? (
        <BubbleButton type="button" onClick={run} title={title}>
          {label}
        </BubbleButton>
      ) : null;

    return (
      <>
        <BubbleDivider />

        <BubbleGroup>
          {btn('⟵▥', 'Spalte links hinzufügen', can.addColumnBefore(), () =>
            editor.chain().focus().addColumnBefore().run()
          )}
          {btn('▥⟶', 'Spalte rechts hinzufügen', can.addColumnAfter(), () =>
            editor.chain().focus().addColumnAfter().run()
          )}
          {btn('✕▥', 'Spalte löschen', can.deleteColumn(), () =>
            editor.chain().focus().deleteColumn().run()
          )}
        </BubbleGroup>

        <BubbleDivider />

        <BubbleGroup>
          {btn('⟰', 'Zeile oberhalb hinzufügen', can.addRowBefore(), () =>
            editor.chain().focus().addRowBefore().run()
          )}
          {btn('⟱', 'Zeile unterhalb hinzufügen', can.addRowAfter(), () =>
            editor.chain().focus().addRowAfter().run()
          )}
          {btn('✕', 'Zeile löschen', can.deleteRow(), () =>
            editor.chain().focus().deleteRow().run()
          )}
        </BubbleGroup>

        <BubbleDivider />

        <BubbleGroup>
          {btn('Merge', 'Zellen verbinden', can.mergeCells(), () =>
            editor.chain().focus().mergeCells().run()
          )}
          {btn('Split', 'Zelle teilen', can.splitCell(), () =>
            editor.chain().focus().splitCell().run()
          )}
          {btn('H↔', 'Header-Zeile an/aus', can.toggleHeaderRow(), () =>
            editor.chain().focus().toggleHeaderRow().run()
          )}
          {btn('H↕', 'Header-Spalte an/aus', can.toggleHeaderColumn(), () =>
            editor.chain().focus().toggleHeaderColumn().run()
          )}
        </BubbleGroup>

        <BubbleDivider />

        <BubbleGroup>
          {btn('🗑', 'Tabelle löschen', can.deleteTable(), () =>
            editor.chain().focus().deleteTable().run()
          )}
        </BubbleGroup>
      </>
    );
  };

  // ---------- Bubble show guard ----------
  const shouldShow = () => {
    if (anyPanelOpen) return true;

    try {
      const st = dragHandlePluginKey.getState(editor.view.state) as
        | { dragging?: boolean; lastDropAt?: number | null }
        | undefined;

      if (st?.dragging) return false;

      const COOLDOWN_MS = 350;
      if (st?.lastDropAt && Date.now() - st.lastDropAt < COOLDOWN_MS)
        return false;
    } catch {}

    const empty = editor.state.selection.empty;
    return editor.isFocused && (!empty || editor.isActive('link'));
  };

  // ---------- Tiptap menu options (typed too strict -> any) ----------
  const menuOptions = useMemo(
    () =>
      ({
        placement: 'top',
        offset: [0, 8],
        interactive: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    []
  );

  // ---------- Color popover renderer ----------
  const renderColorPopover = () => {
    if (!colorPopover) return null;

    const isText = colorPopover === 'text';
    const rect = isText ? textRect : highlightRect;
    if (!rect) return null;

    const title = isText ? 'Textfarbe' : 'Highlight';
    const current = isText ? currentTextColor : currentHighlight || '#fff59d';
    const hexInput = isText ? textHexInput : highlightHexInput;
    const setHexInput = isText ? setTextHexInput : setHighlightHexInput;

    const applyColor = isText ? setTextColor : setHighlightColor;
    const unset = isText ? unsetTextColor : unsetHighlight;

    const top = Math.round(rect.bottom + 8);
    const left = Math.round(rect.left);

    return createPortal(
      <div
        ref={colorPopoverRootRef}
        data-color-popover="true"
        onPointerDown={(e) => {
          e.stopPropagation();
          isDraggingColorRef.current = true;
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          isDraggingColorRef.current = false;
        }}
        onPointerCancel={(e) => {
          e.stopPropagation();
          isDraggingColorRef.current = false;
        }}
        style={{
          position: 'fixed',
          top,
          left,
          zIndex: 99999,
          width: 260,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          background: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          padding: 10,
          touchAction: 'none',
        }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
            {title}
          </div>
          <button
            type="button"
            onClick={() => setColorPopover(null)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: 14,
              lineHeight: 1,
            }}
            aria-label="Schließen"
            title="Schließen (Esc)"
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <HexColorPicker color={current} onChange={applyColor} />
        </div>

        <div
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}
        >
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applyColor(c)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                border: '1px solid #d1d5db',
                background: c,
                cursor: 'pointer',
              }}
              aria-label={`Preset ${c}`}
              title={c}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 12, color: '#6b7280' }}>HEX</span>
          <input
            value={hexInput}
            onChange={(e) => {
              const next = normalizeHex(e.target.value);
              setHexInput(next);
              if (isValidHex(next)) applyColor(next);
            }}
            style={{
              height: 30,
              width: 120,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              padding: '0 8px',
              fontSize: 12,
            }}
          />
          <span style={{ flex: 1 }} />
          <SmallButton type="button" onClick={unset}>
            {isText ? 'Zurücksetzen' : 'Entfernen'}
          </SmallButton>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}
        >
          <SmallButton
            type="button"
            $primary
            onClick={() => setColorPopover(null)}
          >
            Fertig
          </SmallButton>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <TiptapBubbleMenu
        editor={editor}
        options={menuOptions}
        updateDelay={0}
        shouldShow={shouldShow}
      >
        <Bubble onMouseDown={preventEditorBlurOnMouseDown}>
          {/* Inline marks */}
          <BubbleGroup>
            <BubbleButton
              type="button"
              $active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Fett"
            >
              B
            </BubbleButton>

            <BubbleButton
              type="button"
              $active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Kursiv"
            >
              I
            </BubbleButton>

            <BubbleButton
              type="button"
              $active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Unterstrichen"
            >
              U
            </BubbleButton>

            <BubbleButton
              type="button"
              $active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Durchgestrichen"
            >
              S
            </BubbleButton>

            <BubbleButton
              type="button"
              $active={editor.isActive('code')}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
            >
              {'</>'}
            </BubbleButton>

            {!isSingleLine && (
              <>
                <BubbleButton
                  type="button"
                  $active={editor.isActive('superscript')}
                  onClick={toggleSup}
                  title="Hochgestellt"
                >
                  x²
                </BubbleButton>

                <BubbleButton
                  type="button"
                  $active={editor.isActive('subscript')}
                  onClick={toggleSub}
                  title="Tiefgestellt"
                >
                  x₂
                </BubbleButton>
              </>
            )}
          </BubbleGroup>

          <BubbleDivider />

          {!isSingleLine && (
            <>
              {/* Block dropdown */}
              <Dropdown>
                <BubbleButton
                  type="button"
                  $active={
                    openBlock ||
                    editor.isActive('heading') ||
                    editor.isActive('codeBlock')
                  }
                  onClick={() => {
                    setOpenList(false);
                    setOpenLink(false);
                    setOpenEmoji(false);
                    setColorPopover(null);
                    setOpenBlock((v) => !v);
                  }}
                  title="Block"
                >
                  ▦ ▾
                </BubbleButton>

                {openBlock && (
                  <DropdownPanel role="menu" aria-label="Block types">
                    <DropdownItem
                      type="button"
                      $active={editor.isActive('paragraph')}
                      onClick={setParagraph}
                    >
                      Text
                    </DropdownItem>

                    {headingLevels.map((level) => (
                      <DropdownItem
                        key={level}
                        type="button"
                        $active={editor.isActive('heading', { level })}
                        onClick={() => setHeading(level)}
                      >
                        Heading {level}
                      </DropdownItem>
                    ))}

                    <DropdownItem
                      type="button"
                      $active={editor.isActive('codeBlock')}
                      onClick={toggleCodeBlock}
                    >
                      Code (Block)
                    </DropdownItem>

                    <DropdownItem
                      type="button"
                      $muted
                      onClick={() => setOpenBlock(false)}
                    >
                      Aktuell: {currentBlockLabel}
                    </DropdownItem>
                  </DropdownPanel>
                )}
              </Dropdown>

              {/* Blockquote */}
              <BubbleButton
                type="button"
                $active={editor.isActive('blockquote')}
                onClick={toggleBlockquote}
                title="Blockquote"
              >
                “ ”
              </BubbleButton>

              {/* Lists dropdown */}
              <Dropdown>
                <BubbleButton
                  type="button"
                  $active={
                    openList ||
                    editor.isActive('bulletList') ||
                    editor.isActive('orderedList')
                  }
                  onClick={() => {
                    setOpenBlock(false);
                    setOpenLink(false);
                    setOpenEmoji(false);
                    setColorPopover(null);
                    setOpenList((v) => !v);
                  }}
                  title="Liste"
                >
                  ≡ ▾
                </BubbleButton>

                {openList && (
                  <DropdownPanel role="menu" aria-label="Lists">
                    <DropdownItem
                      type="button"
                      $active={editor.isActive('bulletList')}
                      onClick={toggleBulletList}
                    >
                      • Unordered List
                    </DropdownItem>

                    <DropdownItem
                      type="button"
                      $active={editor.isActive('orderedList')}
                      onClick={toggleOrderedList}
                    >
                      1. Ordered List
                    </DropdownItem>
                  </DropdownPanel>
                )}
              </Dropdown>

              <BubbleDivider />

              {/* Emoji */}
              <Dropdown>
                <BubbleButton
                  type="button"
                  $active={openEmoji}
                  onClick={() => {
                    closeAll();
                    setOpenEmoji((v) => !v);
                  }}
                  title="Emoji"
                >
                  🙂
                </BubbleButton>

                {openEmoji && (
                  <DropdownPanel role="dialog" aria-label="Emojis">
                    <EmojiGrid>
                      {EMOJIS.map((e) => (
                        <EmojiButton
                          key={e}
                          type="button"
                          onClick={() => insertEmoji(e)}
                        >
                          {e}
                        </EmojiButton>
                      ))}
                    </EmojiGrid>
                  </DropdownPanel>
                )}
              </Dropdown>

              <BubbleDivider />
            </>
          )}

          {/* Alignment */}
          <BubbleGroup>
            <BubbleButton
              type="button"
              $active={alignActive('left')}
              onClick={() => setAlign('left')}
              title="Links"
            >
              ⟸
            </BubbleButton>
            <BubbleButton
              type="button"
              $active={alignActive('center')}
              onClick={() => setAlign('center')}
              title="Zentriert"
            >
              ≡
            </BubbleButton>
            <BubbleButton
              type="button"
              $active={alignActive('right')}
              onClick={() => setAlign('right')}
              title="Rechts"
            >
              ⟹
            </BubbleButton>
            <BubbleButton
              type="button"
              $active={alignActive('justify')}
              onClick={() => setAlign('justify')}
              title="Blocksatz"
            >
              ☰
            </BubbleButton>
          </BubbleGroup>

          {/* ✅ Context area: Table Controls (nur wenn table + can()) */}
          {renderTableControls()}

          <BubbleDivider />

          {/* Text color trigger */}
          <BubbleButton
            ref={textColorBtnRef}
            data-color-trigger="text"
            type="button"
            $active={colorPopover === 'text' || editor.isActive('textStyle')}
            onClick={() => {
              freezeSelection();
              setOpenBlock(false);
              setOpenList(false);
              setOpenLink(false);
              setOpenEmoji(false);
              setColorPopover((v) => (v === 'text' ? null : 'text'));
            }}
            title="Textfarbe"
          >
            A ▾
          </BubbleButton>

          {/* Highlight trigger */}
          <BubbleButton
            ref={highlightBtnRef}
            data-color-trigger="highlight"
            type="button"
            $active={
              colorPopover === 'highlight' || editor.isActive('highlight')
            }
            onClick={() => {
              freezeSelection();
              setOpenBlock(false);
              setOpenList(false);
              setOpenLink(false);
              setOpenEmoji(false);
              setColorPopover((v) => (v === 'highlight' ? null : 'highlight'));
            }}
            title="Highlight"
          >
            🖍 ▾
          </BubbleButton>

          <BubbleDivider />

          {/* Link */}
          <Dropdown>
            <BubbleButton
              type="button"
              $active={openLink || editor.isActive('link')}
              onClick={openLinkPanel}
              title="Link"
            >
              🔗 ▾
            </BubbleButton>

            {openLink && (
              <DropdownPanel role="dialog" aria-label="Link bearbeiten">
                <FormRow>
                  <Label>URL</Label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    autoFocus
                    data-allow-focus="true"
                  />
                </FormRow>

                <CheckboxRow data-allow-focus="true">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                  />
                  <span>In neuem Tab öffnen</span>
                </CheckboxRow>

                <ButtonRow>
                  <SmallButton type="button" onClick={removeLink}>
                    Entfernen
                  </SmallButton>
                  <SmallButton type="button" $primary onClick={applyLink}>
                    Anwenden
                  </SmallButton>
                </ButtonRow>
              </DropdownPanel>
            )}
          </Dropdown>

          <BubbleDivider />

          {/* Undo / Redo / Clear */}
          <BubbleGroup>
            <BubbleButton
              type="button"
              onClick={undo}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              ↶
            </BubbleButton>
            <BubbleButton
              type="button"
              onClick={redo}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              ↷
            </BubbleButton>
            <BubbleButton
              type="button"
              onClick={clearFormatting}
              title="Formatierung löschen"
            >
              ⨯
            </BubbleButton>
          </BubbleGroup>
        </Bubble>
      </TiptapBubbleMenu>

      {/* ✅ Portal Color Popover (stabil, schließt nicht beim Drag/Transaction) */}
      {renderColorPopover()}
    </>
  );
};

export default BubbleMenu;

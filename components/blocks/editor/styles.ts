'use client';

import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  container-name: editorWrap;
  container-type: inline-size;
`;

export const EditorSurface = styled.div<{ $singleLine?: boolean }>`
  position: relative;
  border: 1px solid rgba(17, 24, 39, 0.14);
  box-sizing: border-box;
  border-radius: 1rem;
  padding: 0.5rem 0;

  .ProseMirror {
    outline: none;
    font-size: 16px;
    line-height: 1.6;
    color: #111827;
    min-height: ${({ $singleLine }) => ($singleLine ? '25px' : '160px')};
    padding: 0 1rem 0 25px;
  }

  .ProseMirror p {
    margin: 0 0 10px 0;
  }

  .ProseMirror p:last-child {
    margin-bottom: 0;
  }

  /* ✅ Placeholder (TipTap): deckt alle Varianten ab */
  .ProseMirror .is-empty::before,
  .ProseMirror .is-editor-empty::before {
    content: attr(data-placeholder);
    float: left;
    color: rgba(17, 24, 39, 0.85);
    pointer-events: none;
    height: 0;
  }

  /* Headings */
  .ProseMirror h1 {
    font-size: 1.75em;
    line-height: 1.25;
    margin: 0.2em 0 0.4em;
    font-weight: 700;
  }
  .ProseMirror h2 {
    font-size: 1.5em;
    line-height: 1.3;
    margin: 0.2em 0 0.35em;
    font-weight: 700;
  }
  .ProseMirror h3 {
    font-size: 1.25em;
    line-height: 1.35;
    margin: 0.2em 0 0.3em;
    font-weight: 700;
  }
  .ProseMirror h4 {
    font-size: 1.1em;
    line-height: 1.4;
    margin: 0.2em 0 0.25em;
    font-weight: 700;
  }
  .ProseMirror h5 {
    font-size: 1em;
    line-height: 1.45;
    margin: 0.2em 0 0.2em;
    font-weight: 700;
  }
  .ProseMirror h6 {
    font-size: 0.95em;
    line-height: 1.5;
    margin: 0.2em 0 0.2em;
    font-weight: 700;
    opacity: 0.9;
  }

  /* Lists */
  .ProseMirror ul,
  .ProseMirror ol {
    margin: 0 0 10px 1.25em;
    padding: 0;
  }

  .ProseMirror li {
    margin: 0.15em 0;
  }

  /* Blockquote */
  .ProseMirror blockquote {
    margin: 10px 0;
    padding: 8px 12px;
    border-left: 4px solid rgba(17, 24, 39, 0.25);
    background: rgba(17, 24, 39, 0.04);
    border-radius: 8px;
  }

  /* Inline code */
  .ProseMirror code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.92em;
    background: rgba(17, 24, 39, 0.06);
    padding: 2px 6px;
    border-radius: 6px;
  }

  /* Code block */
  .ProseMirror pre {
    margin: 10px 0;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(17, 24, 39, 0.06);
    overflow-x: auto;
  }

  .ProseMirror pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.92em;
  }

  /* Links */
  .ProseMirror a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* -----------------------------
   * Tables (stabil + kein Layout-Shift beim Resizen)
   * ----------------------------- */

  .ProseMirror table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;
  }

  .ProseMirror td,
  .ProseMirror th {
    border: 1px solid #ddd;
    box-sizing: border-box;
    min-width: 1em;
    padding: 6px 8px;
    position: relative;
    vertical-align: top;

    /* ✅ verhindert, dass Hover/Resize irgendwelche "extra margins" aus children ziehen */
    > * {
      margin-bottom: 0;
    }
  }

  .ProseMirror th {
    background: #f6f6f6;
    font-weight: 600;
    text-align: left;
  }

  /* ✅ TipTap/ProseMirror setzt selectedCell class */
  .ProseMirror .selectedCell::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(17, 24, 39, 0.06);
    pointer-events: none;
    z-index: 2;
  }

  /* ✅ Resize handle */
  .ProseMirror .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 4px;
    background: rgba(99, 102, 241, 0.8); /* optional sichtbar */
    pointer-events: none; /* ✅ super wichtig */
  }

  /* ✅ Cursor kommt am Root – verhindert Reflow */
  .ProseMirror.resize-cursor {
    cursor: col-resize;
  }

  /* ✅ Wrapper (TableKit nutzt tableWrapper) */
  .ProseMirror .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  /* -----------------------------
   * Notion-like Drag Handle
   * ----------------------------- */

  .tt-drag-handle {
    position: absolute;
    z-index: 9999;
    transform: none;
    top: 0;
    left: 0;
    width: 25px;
    height: 25px;
    padding: 0;

    border-radius: 8px;
    border: none;
    background: transparent;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: grab;
    user-select: none;

    opacity: 0;
    pointer-events: none;

    transition: opacity 120ms ease, background 120ms ease,
      border-color 120ms ease;
  }

  .tt-drag-handle:active {
    cursor: grabbing;
  }

  .tt-drag-handle svg {
    width: 25px;
    height: 25px;
    fill: rgb(140, 140, 140);
  }
`;

export const Bubble = styled.div`
  display: inline-flex;
  flex-flow: row wrap;
  gap: 8px;
  align-items: center;
  background: #111827;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  max-width: calc(100cqw);
`;

export const BubbleGroup = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
`;

export const BubbleDivider = styled.div`
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.18);
`;

export const BubbleButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.14)' : 'transparent'};
  color: white;
  border: 1px solid
    ${({ $active }) =>
      $active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'};
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const Dropdown = styled.div`
  position: relative;
  display: inline-flex;
`;

export const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  background: #0b1220;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  z-index: 9999;
`;

export const DropdownItem = styled.button<{
  $active?: boolean;
  $muted?: boolean;
}>`
  width: 100%;
  text-align: left;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255,255,255,0.35)' : 'transparent')};
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.10)' : 'transparent'};
  color: ${({ $muted }) => ($muted ? 'rgba(255,255,255,0.65)' : '#fff')};
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1.2;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

/* Link Sub-bubble */
export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
`;

export const Input = styled.input`
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  padding: 8px 10px;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const CheckboxRow = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px;
  cursor: pointer;
  user-select: none;

  span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  input {
    width: 14px;
    height: 14px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 6px;
`;

export const SmallButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  border-radius: 8px;
  border: 1px solid
    ${({ $primary }) =>
      $primary ? 'rgba(37,99,235,0.7)' : 'rgba(255,255,255,0.18)'};
  background: ${({ $primary }) =>
    $primary ? 'rgba(37,99,235,0.35)' : 'transparent'};
  color: white;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: ${({ $primary }) =>
      $primary ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.10)'};
  }
`;

/* Color + Emoji panels */
export const ColorRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 6px;
`;

export const ColorSwatch = styled.span<{ $color: string }>`
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

export const ColorInput = styled.input`
  width: 46px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

export const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  padding: 8px;
`;

export const EmojiButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// -----------------------------
// Slash Command UI
// -----------------------------

export const SlashPanel = styled.div`
  width: 320px;
  max-height: 320px;
  overflow: auto;

  background: #0b1220;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  padding: 6px;

  /* nicer scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 12px;
  }
`;

export const SlashRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;

  padding: 10px;
  border-radius: 10px;

  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255,255,255,0.28)' : 'transparent')};
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.10)' : 'transparent'};
  cursor: pointer;
  color: white;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const SlashIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);

  font-size: 14px;
`;

export const SlashText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SlashTitle = styled.div`
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
`;

export const SlashDesc = styled.div`
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.72);
`;

export const SlashEmpty = styled.div`
  padding: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
`;

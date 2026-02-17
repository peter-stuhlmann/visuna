import styled from 'styled-components';
import { EditorContent } from '@tiptap/react';

export const EditorWrapper = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  /* wichtig: sichtbar, damit Popups nicht abgeschnitten werden */
  overflow: visible;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  position: relative;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  border-radius: 1rem 1rem 0 0;
  padding: 6px 8px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  position: relative;
  z-index: 10;
`;

export const ToolbarButton = styled.button<{ $active?: boolean }>`
  font-size: 0.875rem;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  border: 1px solid transparent;
  background-color: ${(props) => (props.$active ? '#e5e7eb' : 'transparent')};
  font-weight: ${(props) => (props.$active ? 600 : 400)};
  cursor: pointer;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    background-color: ${(props) => (props.$active ? '#d1d5db' : '#f3f4f6')};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
    background-color: transparent;
  }
`;

export const ToolbarIconButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  font-size: 0.7rem;
  color: #4b5563;

  &:hover {
    background-color: #e5e7eb;
    border-radius: 4px;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
    background-color: transparent;
  }
`;

export const Separator = styled.span`
  width: 1px;
  height: 25px;
  margin: 0 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    bottom: -5px;
    width: 1px;
    background-color: #d1d5db;
  }
`;

export const EditorBody = styled.div<{ $height: number }>`
  padding: 8px;
  height: ${(props) => props.$height}px;
  overflow: auto;
`;

/**
 * HTML-Body
 */
export const HtmlEditorBody = styled.div<{ $height: number }>`
  padding: 8px;
  height: ${(props) => props.$height}px;
  overflow: auto;
`;

export const HtmlTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  resize: none;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 8px;
  box-sizing: border-box;
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #111827;
  background-color: #f9fafb;

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
    border-color: #3b82f6;
  }
`;

/**
 * Modus-Toggle
 */
export const ModeToggleWrapper = styled.div`
  display: flex;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  overflow: hidden;
`;

export const ModeToggleButton = styled.button<{ $active: boolean }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  background-color: ${(p) => (p.$active ? '#111827' : 'transparent')};
  color: ${(p) => (p.$active ? '#f9fafb' : '#374151')};
  font-weight: 500;

  &:hover {
    background-color: ${(p) => (p.$active ? '#111827' : '#e5e7eb')};
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
`;

export const ColorIcon = styled.button<{ $color: string; $active?: boolean }>`
  font-size: 0.875rem;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  border: 1px solid transparent;
  background-color: ${(props) => (props.$active ? '#e5e7eb' : 'transparent')};
  font-weight: 600;
  color: #111827; /* Icon bleibt schwarz */
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.$active ? '#d1d5db' : '#f3f4f6')};
  }

  svg {
    position: relative;
    top: -2px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 4px;
    width: calc(100% - 8px);
    height: 3px;
    display: block;
    margin-top: -2px;
    background-color: ${(p) => p.$color};
  }
`;

export const ColorInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
`;

/**
 * Wrapper für Custom-Selects
 */

export const Flex = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 2px 4px;
`;

export const SelectWrapper = styled.div<{ $width?: number }>`
  min-width: 60px;

  & > div > div > div {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: ${({ $width }) => ($width ? `${$width}px` : '100%')};
    padding: 1px 0px;
    height: 24px;
  }
`;

/**
 * Emoji-Picker
 */
export const EmojiWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

export const EmojiPopover = styled.div`
  position: absolute;
  top: 115%;
  left: 0;
  padding: 8px;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  max-height: 220px;
  max-width: 260px;
  overflow-y: auto;
  z-index: 20;
`;

export const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
`;

export const EmojiItem = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px;
  border-radius: 4px;

  &:hover {
    background-color: #e5e7eb;
  }
`;

/**
 * Tabellen-Popup
 */
export const TableWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

export const TablePopover = styled.div`
  position: absolute;
  top: 115%;
  left: 0;
  padding: 8px;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  z-index: 20;
  min-width: 220px;
`;

export const TablePopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #374151;
`;

export const TableSelectionLabel = styled.span`
  font-weight: 500;
`;

export const TableGrid = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
  outline: none;
`;

export const TableGridRow = styled.div`
  display: inline-flex;
  gap: 3px;
`;

export const TableGridCell = styled.button<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 3px;
  border: 1px solid #d1d5db;
  background-color: ${(p) => (p.$selected ? '#bfdbfe' : '#f9fafb')};
  cursor: pointer;

  &:hover {
    background-color: #dbeafe;
  }
`;

export const TableHint = styled.div`
  margin-top: 6px;
  font-size: 0.7rem;
  color: #6b7280;
`;

/**
 * Cell-Menü (zweizeilig, light)
 */
export const TableCellMenuWrapper = styled.div<{
  $top: number;
  $left: number;
  $width: number;
}>`
  position: absolute;
  background-color: #ffffff;
  color: #111827;
  border-radius: 0.5rem;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 40;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) =>
    $width}px; /* feste Breite → zwei Reihen bleiben stabil */
`;

export const TableCellMenuRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
`;

export const TableCellMenuButton = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  svg {
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }
`;

export const MenuRowSeparator = styled.div`
  height: 1px;
  width: 100%;
  background-color: #e5e7eb;
`;

/**
 * Button + Menü für "Tabelle löschen"
 */
export const TableMainMenuButton = styled.button`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  color: #4b5563;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  z-index: 35;

  &:hover {
    background-color: #e5e7eb;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
`;

export const TableMainMenuWrapper = styled.div`
  position: absolute;
  background-color: #ffffff;
  color: #111827;
  border-radius: 0.5rem;
  padding: 6px;
  display: flex;
  gap: 4px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 40;
`;

export const TableMainMenuItem = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  svg {
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }
`;

/**
 * Link-Modal
 */
export const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
`;

export const Modal = styled.div`
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 16px 18px;
  width: 320px;
  max-width: calc(100% - 32px);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
`;

export const ModalTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #111827;
`;

export const ModalField = styled.div`
  margin-bottom: 10px;
`;

export const ModalLabel = styled.label`
  display: block;
  font-size: 0.75rem;
  color: #4b5563;
  margin-bottom: 3px;
`;

export const ModalInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
    border-color: #3b82f6;
  }
`;

export const ModalCheckboxRow = styled.div`
  margin: 6px 0 12px 0;

  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #374151;
  }

  input[type='checkbox'] {
    width: 14px;
    height: 14px;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ModalPrimaryButton = styled.button`
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #1d4ed8;
  }

  &:focus-visible {
    outline: 2px solid #1d4ed8;
    outline-offset: 1px;
  }
`;

export const ModalSecondaryButton = styled.button`
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
`;

/**
 * EditorContent von TipTap stylen
 */
export const StyledEditorContent = styled(EditorContent)`
  .ProseMirror {
    outline: none;
    min-height: 100%;
    padding: 4px;
    line-height: 1.5;
    font-size: 0.95rem;
    color: #111827;
  }

  .ProseMirror p {
    margin: 0 0 0.5rem 0;
  }

  .ProseMirror h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
  }

  .ProseMirror h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem 0;
  }

  .ProseMirror h3 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem 0;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.2rem;
    margin: 0 0 0.5rem 0;
  }

  .ProseMirror li {
    margin: 0.1rem 0;
  }

  .ProseMirror blockquote {
    border-left: 3px solid #e5e7eb;
    padding-left: 0.75rem;
    color: #4b5563;
    font-style: italic;
    margin: 0 0 0.5rem 0;
  }

  .ProseMirror code {
    font-family: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #f3f4f6;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .ProseMirror pre {
    font-family: 'SFMono-Regular', ui-monospace, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: #111827;
    color: #f9fafb;
    padding: 8px 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0 0 0.75rem 0;
  }

  .ProseMirror a {
    color: #2563eb;
    text-decoration: underline;
  }

  .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5rem 0;
  }

  .ProseMirror table th,
  .ProseMirror table td {
    border: 1px solid #d1d5db;
    padding: 4px 6px;
    font-size: 0.85rem;
  }

  .ProseMirror:focus {
    outline: none;
  }
`;

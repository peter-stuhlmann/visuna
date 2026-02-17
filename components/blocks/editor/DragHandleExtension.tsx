import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, NodeSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MdDragIndicator } from 'react-icons/md';

export const dragHandlePluginKey = new PluginKey('block-drag-handle');

type HandleState = {
  visible: boolean;
  top: number;
  left: number;
  pos: number | null;

  dragging: boolean;
  dragPos: number | null;

  // ✅ neu: BubbleMenu blocken nach Drop
  lastDropAt: number | null;
};

const initialState: HandleState = {
  visible: false,
  top: 0,
  left: 0,
  pos: null,
  dragging: false,
  dragPos: null,
  lastDropAt: null,
};

const HANDLE_WIDTH = 22;
const CONTENT_GAP = 10;
const PROSEMIRROR_PADDING_LEFT = HANDLE_WIDTH + CONTENT_GAP; // 32

function isBlockNodeName(name: string) {
  return (
    name === 'paragraph' ||
    name === 'heading' ||
    name === 'blockquote' ||
    name === 'codeBlock' ||
    name === 'bulletList' ||
    name === 'orderedList' ||
    name === 'listItem' ||
    name === 'horizontalRule'
  );
}

const PRIORITY: Record<string, number> = {
  listItem: 100,
  blockquote: 90,
  codeBlock: 80,
  heading: 70,
  paragraph: 60,
  bulletList: 50,
  orderedList: 50,
  horizontalRule: 40,
};

function findDraggableBlockAtCoords(
  view: EditorView,
  clientX: number,
  clientY: number
) {
  const res = view.posAtCoords({ left: clientX, top: clientY });
  if (!res) return null;

  const $pos = view.state.doc.resolve(res.pos);

  let best: { pos: number; dom: HTMLElement; name: string } | null = null;

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (!node) continue;

    const name = node.type.name;
    if (!node.isBlock) continue;
    if (!isBlockNodeName(name)) continue;

    const pos = $pos.before(depth);
    const dom = view.nodeDOM(pos) as HTMLElement | null;
    if (!dom) continue;

    const prio = PRIORITY[name] ?? 0;
    const bestPrio = best ? PRIORITY[best.name] ?? 0 : -1;

    if (!best || prio > bestPrio) best = { pos, dom, name };
  }

  return best ? { pos: best.pos, dom: best.dom } : null;
}

function getSafeX(parent: HTMLElement, clientX: number) {
  const parentRect = parent.getBoundingClientRect();
  const gutterRightEdge = parentRect.left + PROSEMIRROR_PADDING_LEFT;
  return clientX < gutterRightEdge ? gutterRightEdge + 1 : clientX;
}

type InsertTarget = { pos: number; assoc: 1 | -1 };

function getInsertTargetFromCoords(
  view: EditorView,
  parent: HTMLElement,
  clientX: number,
  clientY: number
): InsertTarget | null {
  const safeX = getSafeX(parent, clientX);

  const res = view.posAtCoords({ left: safeX, top: clientY });

  if (!res) {
    const editorRect = view.dom.getBoundingClientRect();
    if (clientY > editorRect.bottom) {
      return { pos: view.state.doc.content.size, assoc: 1 };
    }
    return null;
  }

  const found = findDraggableBlockAtCoords(view, safeX, clientY);

  if (!found) {
    const editorRect = view.dom.getBoundingClientRect();
    if (clientY > editorRect.bottom) {
      return { pos: view.state.doc.content.size, assoc: 1 };
    }
    return { pos: res.pos, assoc: 1 };
  }

  const { pos: blockPos, dom } = found;
  const blockNode = view.state.doc.nodeAt(blockPos);
  if (!blockNode) return null;

  const rect = dom.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;

  if (clientY < midY) {
    return { pos: blockPos, assoc: -1 };
  }

  return { pos: blockPos + blockNode.nodeSize, assoc: 1 };
}

function moveBlock(view: EditorView, from: number, targetRaw: InsertTarget) {
  const { state } = view;

  const node = state.doc.nodeAt(from);
  if (!node) return false;

  const nodeSize = node.nodeSize;
  const fromTo = from + nodeSize;

  // drop in sich selbst
  if (targetRaw.pos >= from && targetRaw.pos <= fromTo) return false;

  let tr = state.tr;

  // delete source
  tr = tr.delete(from, fromTo);

  // map target pos
  let mapped = tr.mapping.map(targetRaw.pos, targetRaw.assoc);
  mapped = Math.max(0, Math.min(mapped, tr.doc.content.size));

  // insert node
  tr = tr.insert(mapped, node);

  // optional selection (führt BubbleMenu normalerweise aus – deswegen blocken wir es im BubbleMenu!)
  try {
    tr = tr.setSelection(NodeSelection.create(tr.doc, mapped));
  } catch {
    // ignore
  }

  view.dispatch(tr);
  view.focus();
  return true;
}

export const DragHandleExtension = Extension.create({
  name: 'dragHandle',

  addProseMirrorPlugins() {
    return [
      new Plugin<HandleState>({
        key: dragHandlePluginKey,

        props: {
          handleDOMEvents: {
            dragover(view, event) {
              const st = dragHandlePluginKey.getState(view.state) as
                | HandleState
                | undefined;
              if (!st?.dragging) return false;

              event.preventDefault();
              const e = event as DragEvent;
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
              return true;
            },

            drop(view, event) {
              const st = dragHandlePluginKey.getState(view.state) as
                | HandleState
                | undefined;
              if (!st?.dragging || st.dragPos == null) return false;

              event.preventDefault();
              event.stopPropagation();

              const e = event as DragEvent;

              const parent = view.dom.parentElement as HTMLElement | null;
              if (!parent) return true;

              const target = getInsertTargetFromCoords(
                view,
                parent,
                e.clientX,
                e.clientY
              );

              if (target) {
                moveBlock(view, st.dragPos, target);
              }

              // ✅ Cleanup + Drop-Timestamp (BubbleMenu Cooldown)
              view.dispatch(
                view.state.tr.setMeta(dragHandlePluginKey, {
                  dragging: false,
                  dragPos: null,
                  lastDropAt: Date.now(),
                })
              );

              return true; // block PM default drop
            },
          },
        },

        state: {
          init: () => initialState,
          apply: (tr, prev) => {
            const meta = tr.getMeta(dragHandlePluginKey) as
              | Partial<HandleState>
              | undefined;
            if (!meta) return prev;
            return { ...prev, ...meta };
          },
        },

        view: (view) => {
          const handle = document.createElement('button');
          handle.type = 'button';
          handle.className = 'tt-drag-handle';
          handle.setAttribute('aria-label', 'Block verschieben');
          handle.setAttribute('title', 'Ziehen zum Verschieben');
          handle.draggable = true;

          handle.innerHTML = renderToStaticMarkup(
            <MdDragIndicator aria-hidden="true" focusable="false" />
          );

          const parent = view.dom.parentElement as HTMLElement | null;
          if (!parent) return { destroy() {} };

          parent.style.position ||= 'relative';
          parent.appendChild(handle);

          let raf = 0;

          const setState = (partial: Partial<HandleState>) => {
            view.dispatch(view.state.tr.setMeta(dragHandlePluginKey, partial));
          };

          const updateHandlePosition = (clientX: number, clientY: number) => {
            const st = dragHandlePluginKey.getState(view.state) as
              | HandleState
              | undefined;
            if (st?.dragging) return;

            const safeX = getSafeX(parent, clientX);
            const found = findDraggableBlockAtCoords(view, safeX, clientY);

            if (!found) {
              setState({ visible: false, pos: null });
              return;
            }

            const parentRect = parent.getBoundingClientRect();
            const domRect = found.dom.getBoundingClientRect();

            const top = domRect.top - parentRect.top + 2;

            setState({ visible: true, top, left: 0, pos: found.pos });
          };

          const onMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest?.('.tt-drag-handle')) return;

            cancelAnimationFrame(raf);
            raf = window.requestAnimationFrame(() => {
              updateHandlePosition(e.clientX, e.clientY);
            });
          };

          const onMouseLeave = () => {
            const st = dragHandlePluginKey.getState(view.state) as
              | HandleState
              | undefined;
            if (st?.dragging) return;
            setState({ visible: false, pos: null });
          };

          // ✅ Click soll nix im Editor auslösen
          handle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });

          // ✅ mousedown nicht preventDefault (sonst killt Dragstart oft!)
          handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });

          handle.addEventListener('dragstart', (e) => {
            const st = dragHandlePluginKey.getState(view.state) as
              | HandleState
              | undefined;
            if (!st?.visible || st.pos == null) return;

            // Auswahl erst beim echten Drag
            view.dispatch(
              view.state.tr.setSelection(
                NodeSelection.create(view.state.doc, st.pos)
              )
            );
            view.focus();

            setState({ dragging: true, dragPos: st.pos });

            e.dataTransfer?.setDragImage(handle, 10, 10);
            if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
          });

          const onDragEnd = () => {
            // ✅ Drag-End: BubbleMenu ebenfalls kurz blocken
            setState({
              dragging: false,
              dragPos: null,
              lastDropAt: Date.now(),
            });
          };
          window.addEventListener('dragend', onDragEnd);

          parent.addEventListener('mousemove', onMouseMove);
          parent.addEventListener('mouseleave', onMouseLeave);

          const applyStateToDOM = () => {
            const st = dragHandlePluginKey.getState(view.state) as
              | HandleState
              | undefined;
            if (!st || !st.visible || st.pos == null) {
              handle.style.opacity = '0';
              handle.style.pointerEvents = 'none';
              return;
            }

            handle.style.opacity = '1';
            handle.style.pointerEvents = 'auto';
            handle.style.top = `${st.top}px`;
            handle.style.left = `${st.left}px`;
          };

          applyStateToDOM();

          return {
            update: () => applyStateToDOM(),
            destroy: () => {
              cancelAnimationFrame(raf);
              parent.removeEventListener('mousemove', onMouseMove);
              parent.removeEventListener('mouseleave', onMouseLeave);
              window.removeEventListener('dragend', onDragEnd);
              handle.remove();
            },
          };
        },
      }),
    ];
  },
});

'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type RenderContent<T> = (item: T, index: number) => React.ReactNode;

export type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  onChange: (next: T[]) => void;
  /** Optional: e.g. to stamp an `order: 1..n` field */
  reindex?: (list: T[]) => T[];
  /** Your item content (without controls; those are added automatically) */
  renderItem: RenderContent<T>;
  /** Optional delete handler to show a 🗑 button */
  onDelete?: (item: T, index: number) => void;
  /** Layout classes/styles */
  className?: string;
  style?: React.CSSProperties;
  /** Item wrapper classes/styles */
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  /** Button labels */
  labels?: Partial<{
    drag: string;
    top: string;
    up: string;
    down: string;
    bottom: string;
    delete: string;
  }>;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const defaultLabels = {
  drag: 'Ziehen zum Sortieren',
  top: 'Ganz nach oben',
  up: 'Nach oben',
  down: 'Nach unten',
  bottom: 'Ganz nach unten',
  delete: 'Löschen',
};

function SortableItem<T>({
  item,
  index,
  id,
  total,
  renderContent,
  moveToIndex,
  onDelete,
  itemClassName,
  itemStyle,
  labels,
}: {
  item: T;
  index: number;
  id: string;
  total: number;
  renderContent: RenderContent<T>;
  moveToIndex: (from: number, to: number) => void;
  onDelete?: (item: T, index: number) => void;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  labels: Required<NonNullable<SortableListProps<T>['labels']>>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.85 : 1,
    ...itemStyle,
  };

  return (
    <div ref={setNodeRef} className={itemClassName} style={style}>
      {/* Controls in eigenem Wrapper */}
      <div
        className="sl-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          {...attributes}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(listeners as any)}
          title={labels.drag}
          aria-label={labels.drag}
          style={{
            cursor: 'grab',
            border: '1px solid #ddd',
            background: '#fff',
            borderRadius: 8,
            padding: '6px 10px',
          }}
        >
          ☰ Drag
        </button>

        <div className="sl-buttons" style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => moveToIndex(index, 0)}
            title={labels.top}
          >
            ⏫
          </button>
          <button
            type="button"
            onClick={() => moveToIndex(index, index - 1)}
            title={labels.up}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveToIndex(index, index + 1)}
            title={labels.down}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => moveToIndex(index, total - 1)}
            title={labels.bottom}
          >
            ⏬
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item, index)}
              title={labels.delete}
              aria-label={labels.delete}
              style={{
                marginLeft: 8,
                border: '1px solid #f2d6d6',
                background: '#fff5f5',
                color: '#b00020',
                borderRadius: 8,
                padding: '6px 10px',
              }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <div className="sl-content">{renderContent(item, index)}</div>
    </div>
  );
}

export default function SortableList<T>({
  items,
  getId,
  onChange,
  reindex,
  renderItem,
  onDelete,
  className,
  style,
  itemClassName,
  itemStyle,
  labels: labelsProp,
}: SortableListProps<T>) {
  const labels = { ...defaultLabels, ...(labelsProp ?? {}) };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = React.useMemo(() => (items ?? []).map(getId), [items, getId]);

  const commit = React.useCallback(
    (next: T[]) => onChange(reindex ? reindex(next) : next),
    [onChange, reindex]
  );

  const moveToIndex = React.useCallback(
    (from: number, to: number) => {
      if (!items || from < 0 || from >= items.length) return;
      const clamped = clamp(to, 0, items.length - 1);
      const next = arrayMove(items, from, clamped);
      commit(next);
    },
    [items, commit]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    moveToIndex(oldIndex, newIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className} style={style}>
          {(items ?? []).map((item, idx) => (
            <SortableItem<T>
              key={getId(item)}
              id={getId(item)}
              item={item}
              index={idx}
              total={items.length}
              moveToIndex={moveToIndex}
              renderContent={renderItem}
              onDelete={onDelete}
              itemClassName={itemClassName}
              itemStyle={itemStyle}
              labels={labels}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/** Helper: create a reindexer for an `order` field */
export const makeReindexer =
  <T,>(setOrder: (item: T, order: number) => T) =>
  (list: T[]) =>
    list.map((it, i) => setOrder(it, i + 1));

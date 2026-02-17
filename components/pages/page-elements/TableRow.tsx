'use client';

import { FC, useMemo, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import PageElementsListItem from '../page-elements-list-item/PageElementsListItem';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

/* ---------- Props ---------- */
export type DraggableRowProps = {
  element: PageElement;
  workspaceId: string;
  onEdit: () => void;
  onDelete: () => void;
  onVisibilityChange: (visible: boolean) => void;
};

/* ---------- Public component ---------- */
const DraggableRow: FC<DraggableRowProps> = (props) => {
  return <SortableRow {...props} />;
};

export default DraggableRow;

/* ---------- Sortable variant ---------- */
const SortableRow: FC<DraggableRowProps> = ({
  element,
  workspaceId,
  onEdit,
  onDelete,
  onVisibilityChange,
}) => {
  const id = String(element._id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.7 : 1,
    }),
    [transform, transition, isDragging]
  );

  /* ---------- Hover + Drag Events ---------- */
  useEffect(() => {
    if (isDragging) {
      window.dispatchEvent(new Event('pe-drag-active'));
    } else {
      window.dispatchEvent(new Event('pe-drag-inactive'));
    }
  }, [isDragging]);

  return (
    <Wrapper
      ref={setNodeRef}
      style={style}
      tabIndex={0}
      role="listitem"
    >
      <DragHandle
        {...attributes}
        {...listeners}
        aria-label="Verschieben"
      >
        ☰
      </DragHandle>

      <PageElementsListItem
        element={element}
        workspaceId={workspaceId}
        onEdit={onEdit}
        onDelete={onDelete}
        onVisibilityChange={onVisibilityChange}
        draggable
      />
    </Wrapper>
  );
};

/* ---------- Styles ---------- */

const Wrapper = styled.div`
  position: relative;
`;

const DragHandle = styled.button`
  position: absolute;
  z-index: 2;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: grab;
  background: transparent;
  border: none;
  font-size: 18px;
  padding: 4px;

  &:active {
    cursor: grabbing;
  }
`;

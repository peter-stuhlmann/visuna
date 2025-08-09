'use client';

import { FC, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import formElements from './data/pageElementsOptions';
import { PageElement } from '@/components/content-elements/default/types';

type DraggableTableRowProps = {
  element: PageElement;
  onEdit: () => void;
  onDelete: () => void;
};

const DraggableTableRow: FC<DraggableTableRowProps> = ({
  element,
  onEdit,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: element.order !== undefined ? element.order : element._id.toString(),
    });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const idAsString = String(element._id);

  const typeName =
    formElements.find((item) => item.value === element.element)?.value ||
    element.element;

  const fireHoverStart = () =>
    window.dispatchEvent(
      new CustomEvent('pe-hover', { detail: { id: idAsString } })
    );
  const fireHoverEnd = () => window.dispatchEvent(new Event('pe-hover-clear'));

  return (
    <Tr
      ref={setNodeRef}
      style={style}
      data-id={idAsString}
      onMouseEnter={fireHoverStart}
      onMouseLeave={fireHoverEnd}
      onFocus={fireHoverStart}
      onBlur={fireHoverEnd}
      tabIndex={0}
    >
      <Td style={{ width: 70 }}>
        <DragHandle {...attributes} {...listeners} title="Verschieben">
          ☰
        </DragHandle>
      </Td>
      <Td style={{ width: 100 }}>{element.order}</Td>
      <Td>{element.name}</Td>
      <Td>{typeName}</Td>
      <Td style={{ width: 175, whiteSpace: 'nowrap' }}>
        <IconGroup>
          <Tooltip title="Bearbeiten">
            <IconButton onClick={onEdit}>✏️</IconButton>
          </Tooltip>
          <Tooltip title="Löschen">
            <IconButton onClick={onDelete}>🗑️</IconButton>
          </Tooltip>
        </IconGroup>
      </Td>
    </Tr>
  );
};

export default DraggableTableRow;

/* Styles (unverändert) */
export const Tr = styled.tr``;

export const Td = styled.td`
  padding: 10px;
  vertical-align: middle;
`;

export const DragHandle = styled.button`
  cursor: grab;
  background: transparent;
  border: none;
  font-size: 16px;
  line-height: 1;
  padding: 4px;

  &:active {
    cursor: grabbing;
  }
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.7;
  }
`;

export const Tooltip = styled.span<{ title: string }>`
  position: relative;

  &::after {
    content: attr(title);
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 12px;
    background-color: #333;
    color: #fff;
    padding: 4px 6px;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }
`;

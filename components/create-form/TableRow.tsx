import { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import formElements from './data/formElementsOptions';
import { FormElement } from '@/components/templates/form/Form.types';
// import {
//   Tr,
//   Td,
//   IconGroup,
//   IconButton,
//   DragHandle,
//   Tooltip,
// } from './DraggableTableRow.styled';

type DraggableTableRowProps = {
  element: FormElement;
  onEdit: () => void;
  onDelete: () => void;
};

const DraggableTableRow: FC<DraggableTableRowProps> = ({
  element,
  onEdit,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeLabel =
    formElements.find((item) => item.value === element.type)?.label ||
    element.type;

  return (
    <Tr ref={setNodeRef} style={style}>
      <Td style={{ width: 70 }}>
        <DragHandle {...attributes} {...listeners} title="Verschieben">
          ☰
        </DragHandle>
      </Td>
      <Td style={{ width: 100 }}>{element.order}</Td>
      <Td>{element.name}</Td>
      <Td>{typeLabel}</Td>
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
import styled from 'styled-components';

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

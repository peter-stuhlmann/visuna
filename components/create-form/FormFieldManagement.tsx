'use client';

import { useState } from 'react';
import { FC } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import AddFormElement from '@/components/create-form/AddFormElement';
import DraggableTableRow from './TableRow';
import { FormFieldManagementProps } from './FormFieldManagement.types';
import { FormElement } from '@/components/templates/form/Form.types';
import { StyledTable } from '../pages/pages-list/PagesList';

const FormFieldManagement: FC<FormFieldManagementProps> = ({ form }) => {
  const [formElements, setFormElements] = useState<FormElement[]>(
    form?.formElements || []
  );
  const [editElement, setEditElement] = useState<FormElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  if (!form) return null;

  const saveAllToApi = async (updatedElements: FormElement[]) => {
    try {
      const response = await fetch('/api/update-form-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form._id,
          formElements: updatedElements,
        }),
      });
      if (!response.ok) throw new Error('Fehler beim Speichern des Formulars');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddElement = async (newElement: Omit<FormElement, 'order'>) => {
    const nextOrder = formElements.length + 1;
    const newFormElement: FormElement = { ...newElement, order: nextOrder };
    const updatedElements = [...formElements, newFormElement];

    await saveAllToApi(updatedElements);
    setFormElements(updatedElements);
    closeDialog();
  };

  const handleEditElement = async (updatedElement: FormElement) => {
    const updatedElements = formElements.map((el) =>
      el.order === updatedElement.order ? updatedElement : el
    );

    await saveAllToApi(updatedElements);
    setFormElements(updatedElements);
    closeDialog();
  };

  const handleDelete = async (order: number) => {
    const updatedElements = formElements
      .filter((el) => el.order !== order)
      .map((el, idx) => ({ ...el, order: idx + 1 }));

    try {
      const response = await fetch('/api/update-form-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form._id,
          formElements: updatedElements,
        }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern der Änderungen');
      setFormElements(updatedElements);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormElements((prev) => {
        const oldIndex = prev.findIndex((el) => el.order === active.id);
        const newIndex = prev.findIndex((el) => el.order === over?.id);
        const reordered = [...prev];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const updated = reordered.map((el, idx) => ({ ...el, order: idx + 1 }));
        saveAllToApi(updated);
        return updated;
      });
    }
  };

  const openDialog = (element: FormElement | null) => {
    setEditElement(element);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditElement(null);
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={formElements.map((el) => el.order)}
          strategy={verticalListSortingStrategy}
        >
          <TableWrapper>
            <StyledTable>
              <Thead>
                <Tr>
                  <Th style={{ width: '70px' }} />
                  <Th style={{ width: '100px' }}>Order</Th>
                  <Th>Name</Th>
                  <Th>Typ</Th>
                  <Th style={{ width: '175px' }}>Aktionen</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formElements.length > 0 ? (
                  formElements.map((element) => (
                    <DraggableTableRow
                      key={element.order}
                      element={element}
                      onEdit={() => openDialog(element)}
                      onDelete={() => handleDelete(element.order)}
                    />
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} style={{ textAlign: 'center' }}>
                      Es wurden noch keine Formular-Elemente hinzugefügt
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </StyledTable>
          </TableWrapper>
        </SortableContext>
      </DndContext>

      <Button onClick={() => openDialog(null)}>
        {formElements.length > 0
          ? 'Weiteres Formular-Element hinzufügen'
          : 'Formular-Element hinzufügen'}
      </Button>

      {isDialogOpen ? (
        <DialogOverlay>
          <DialogBox>
            <DialogTitle>
              {editElement
                ? 'Formular-Element bearbeiten'
                : 'Neues Formular-Element hinzufügen'}
              <CloseButton onClick={closeDialog}>&times;</CloseButton>
            </DialogTitle>
            <AddFormElement
              initialData={editElement}
              onSave={(formElement) => {
                const fullElement: FormElement = {
                  ...formElement,
                  name: formElement.name || '',
                  order:
                    formElement.order ??
                    editElement?.order ??
                    formElements.length + 1,
                  id: formElement.id,
                  type: formElement.type,
                };
                if (editElement) {
                  handleEditElement(fullElement);
                } else {
                  handleAddElement(fullElement);
                }
              }}
              closeDialog={closeDialog}
            />
          </DialogBox>
        </DialogOverlay>
      ) : null}
    </>
  );
};

export default FormFieldManagement;

import styled from 'styled-components';
import { Button } from '../content-elements/default';

export const Tbody = styled.tbody``;

export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;

  &:hover {
    color: #000;
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border-bottom: 1px solid #eaeaea;
  }

  tbody tr:hover {
    background-color: #f9f9f9;
  }
`;

export const Thead = styled.thead`
  background-color: #f1f1f1;
`;

export const Th = styled.th`
  text-align: left;
  font-weight: 600;
`;

export const Td = styled.td`
  white-space: nowrap;
`;

export const Tr = styled.tr``;

export const AddButton = styled.button`
  padding: 10px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #177ddc;
  }
`;

export const DialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const DialogBox = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

export const DialogTitleStyled = styled.h2`
  margin: 0 0 16px;
  font-size: 20px;
`;

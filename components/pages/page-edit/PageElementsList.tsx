// PageElementEdit.tsx
'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  PageElement,
  AllElementData,
} from '@/components/content-elements/default/types';
import { Button } from '@/components/content-elements/default';
import { useStatus } from '@/components/status/StatusContext';
import Modal from '@/components/Modal';
import DraggableTableRow from './TableRow';
import styled from 'styled-components';
import { usePageElements } from '@/components/usePageElements';
import CreatePageClientWrapper from '@/components/CreatePageClientWrapper';
import ContentElementSettingsWrapper, {
  ContentElementSettingsWrapperHandle,
} from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';

type PageElementEditProps = {
  page: {
    _id: string;
    pageElements: PageElement[];
  };
};

const PageElementEdit: FC<PageElementEditProps> = ({ page }) => {
  const { addStatus } = useStatus();

  const {
    pageElements,
    setPageElements,
    editingElementId,
    setEditingElementId,
    updatePageElement,
  } = usePageElements();

  const settingsRef = useRef<ContentElementSettingsWrapperHandle>(null);

  const originalRef = useRef<{ id: string; data: AllElementData } | null>(null);

  useEffect(() => {
    if (page.pageElements?.length > 0) {
      const normalized = page.pageElements.map((el, idx) => ({
        ...el,
        _id: el._id?.toString?.() ?? `missing-id-${idx + 1}`,
        order: el.order ?? idx + 1,
      }));
      setPageElements(normalized);
    } else {
      setPageElements([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page._id]);

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const closeModal = () => {
    setEditOpen(false);
    setCreateOpen(false);
    setEditingElementId(null);
    originalRef.current = null;
  };

  const saveAllToApi = async (updatedElements: PageElement[]) => {
    console.log('Saving updated elements:', updatedElements);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/delete-page-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageElementId: id }),
      });

      const filtered = pageElements.filter((el) => el._id !== id);
      const reOrdered = filtered.map((el, idx) => ({ ...el, order: idx + 1 }));
      setPageElements(reOrdered);

      await saveAllToApi(reOrdered);

      addStatus({
        type: 'success',
        message: 'Seitenelement erfolgreich gelöscht.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pageElements.findIndex((el) => el.order === active.id);
    const newIndex = pageElements.findIndex((el) => el.order === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = [...pageElements];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    const reOrdered = next.map((el, idx) => ({ ...el, order: idx + 1 }));
    setPageElements(reOrdered);
    await saveAllToApi(reOrdered);
  };

  const openEditFor = (element: PageElement) => {
    const original =
      typeof structuredClone === 'function'
        ? structuredClone(element.data)
        : JSON.parse(JSON.stringify(element.data));
    originalRef.current = { id: element._id, data: original };

    setEditingElementId(element._id);
    setEditOpen(true);
  };

  const handleCancelEdit = () => {
    const snap = originalRef.current;
    if (snap) {
      updatePageElement(snap.id, { data: snap.data });
    }
    closeModal();
    addStatus({ type: 'info', message: 'Daten wurden nicht gespeichert.' });
  };

  const handleSaveAndClose = async () => {
    const ok = await settingsRef.current?.save();
    if (ok) closeModal();
  };

  const sortableItems = useMemo(
    () => pageElements.map((el, idx) => el.order ?? idx + 1),
    [pageElements]
  );

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          <TableWrapper>
            <Table>
              <Thead>
                <tr>
                  <Th style={{ width: 70 }} />
                  <Th style={{ width: 100 }}>Order</Th>
                  <Th>Name</Th>
                  <Th>Typ</Th>
                  <Th style={{ width: 175 }}>Aktionen</Th>
                </tr>
              </Thead>
              <tbody>
                {pageElements.length > 0 ? (
                  pageElements.map((el) => (
                    <DraggableTableRow
                      key={el._id}
                      element={el}
                      onEdit={() => openEditFor(el)}
                      onDelete={() => handleDelete(el._id)}
                    />
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} style={{ textAlign: 'center' }}>
                      Es wurden noch keine Seiten-Elemente hinzugefügt
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </SortableContext>
      </DndContext>

      <Button onClick={() => setCreateOpen(true)}>
        {pageElements.length > 0 && 'Weiteres'} Seiten-Element hinzufügen
      </Button>

      {createOpen && (
        <Modal onClose={closeModal}>
          <ModalBody>
            <StickyBar>
              <Button onClick={closeModal}>Schließen</Button>
            </StickyBar>

            <h2>Seitenelement erstellen</h2>
            <CreatePageClientWrapper pageId={page._id} />
          </ModalBody>
        </Modal>
      )}

      {editOpen && editingElementId && (
        <Modal onClose={handleCancelEdit /* ESC/X = Abbrechen */}>
          <ModalBody>
            <StickyBar>
              <Button onClick={handleCancelEdit}>Abbrechen</Button>
              <Button variant="contained" onClick={handleSaveAndClose}>
                Speichern und schließen
              </Button>
            </StickyBar>
            <div style={{ padding: '2rem' }}>
              <h2>Seitenelement bearbeiten</h2>
              <ContentElementSettingsWrapper
                ref={settingsRef}
                handleCloseModal={handleSaveAndClose}
                onCancel={handleCancelEdit}
              />
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default PageElementEdit;

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

/* ---------- Modal-intern ---------- */
const ModalBody = styled.div`
  position: relative;
  max-height: 100%;
`;

const StickyBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid #eaeaea;
`;

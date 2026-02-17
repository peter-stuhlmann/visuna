'use client';

import {
  FC,
  ReactNode,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import styled from 'styled-components';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import DraggableRow from '../TableRow';
import { Icon } from '@/components/content-elements/default';
import { usePageElements } from '@/components/usePageElements';
import { useStatus } from '@/components/status/StatusContext';
import { usePersistPageElementVisibility } from '../hooks/usePersistPageElementVisibility';

type PageElementsTableProps = {
  isMounted: boolean;
  pageElements: PageElement[];
  sortableItems: string[];
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (el: PageElement) => void;
  onDelete: (id: string) => void;
  onInsertAfter: (afterId: string | null) => void;
  workspaceId: string;
};

const PageElementsTable: FC<PageElementsTableProps> = ({
  isMounted,
  pageElements,
  sortableItems,
  onDragEnd,
  onEdit,
  onDelete,
  onInsertAfter,
  workspaceId,
}) => {
  const { updatePageElement } = usePageElements();
  const { addStatus } = useStatus();

  /* ---------- Insert suppression ---------- */
  const [suspendInsert, setSuspendInsert] = useState(false);

  useEffect(() => {
    const on = () => setSuspendInsert(true);
    const off = () => setSuspendInsert(false);

    window.addEventListener('pe-hover', on);
    window.addEventListener('pe-hover-clear', off);
    window.addEventListener('pe-drag-active', on);
    window.addEventListener('pe-drag-inactive', off);

    return () => {
      window.removeEventListener('pe-hover', on);
      window.removeEventListener('pe-hover-clear', off);
      window.removeEventListener('pe-drag-active', on);
      window.removeEventListener('pe-drag-inactive', off);
    };
  }, []);



// ... inside component ...
  const { persistVisibility } = usePersistPageElementVisibility(workspaceId);

  const body: ReactNode = useMemo(() => {
    if (pageElements.length === 0) {
      return (
        <EmptyWrap>
          <InsertRow $visible $disabled={suspendInsert}>
            <AddPageElementButton onClick={() => onInsertAfter(null)}>
              Element hinzufügen
            </AddPageElementButton>
          </InsertRow>
        </EmptyWrap>
      );
    }

    return (
      <ListWrapper role="list" aria-label="Seitenelemente">
        {pageElements.map((el, index) => {
          const id = String(el._id);
          const prevId = index > 0 ? String(pageElements[index - 1]._id) : null;

          return (
            <Item key={id}>
              <InsertRow $disabled={suspendInsert}>
                <AddPageElementButton onClick={() => onInsertAfter(prevId)}>
                  <Icon name="IoMdAdd" size={16} />
                </AddPageElementButton>
              </InsertRow>

              <RowWrap>
                <DraggableRow
                  element={el}
                  workspaceId={workspaceId}
                  onEdit={() => onEdit(el)}
                  onDelete={() => onDelete(id)}
                  onVisibilityChange={async (visible) => {
                    const prev = el.visible !== false;
                    updatePageElement(el._id, { visible });
                    const ok = await persistVisibility(
                      id,
                      el.pageId,
                      visible
                    );
                    if (!ok) updatePageElement(el._id, { visible: prev });
                  }}
                />
              </RowWrap>

              <InsertRow $disabled={suspendInsert}>
                <AddPageElementButton onClick={() => onInsertAfter(id)}>
                  <Icon name="IoMdAdd" size={16} />
                </AddPageElementButton>
              </InsertRow>
            </Item>
          );
        })}
      </ListWrapper>
    );
  }, [
    pageElements,
    suspendInsert,
    onInsertAfter,
    workspaceId,
    onEdit,
    onDelete,
    persistVisibility,
    updatePageElement,
  ]);

  if (!isMounted) return <>{body}</>;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {body}
      </SortableContext>
    </DndContext>
  );
};

export default PageElementsTable;

/* ---------------- Styles ---------------- */

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 30px;
`;

const Item = styled.div`
  position: relative;
`;

const RowWrap = styled.div`
  position: relative;
`;

const InsertRow = styled.div<{ $visible?: boolean; $disabled?: boolean }>`
  display: flex;
  justify-content: center;
  height: 0;
  position: relative;
  
  opacity: ${({ $visible, $disabled }) => ($disabled ? 0 : $visible ? 1 : 0)};
  pointer-events: ${({ $visible, $disabled }) =>
    $disabled ? 'none' : $visible ? 'auto' : 'none'};

  ${Item}:hover & {
    opacity: ${({ $disabled }) => ($disabled ? 0 : 1)};
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  }
`;

const AddPageElementButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  z-index: 1;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  height: 30px;
  cursor: pointer;
  box-sizing: border-box;
  margin-top: -15px;
  font-size: 12px;
`;

const EmptyWrap = styled.div`
  width: 100%;
  margin-top: 30px;
`;

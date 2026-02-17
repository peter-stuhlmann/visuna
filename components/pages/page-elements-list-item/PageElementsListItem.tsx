'use client';

import { FC } from 'react';
import { Icon } from '@/components/content-elements/default';

import {
  CardRow,
  NameCell,
  SlugCell,
  DateCell,
  VisibilityCell,
  ActionsCell,
  ActionButton,
} from '../pages-list-item/PagesListItem.styles';

import PageElementVisibilityStatus from '@/components/page-elements-visibility-status/PageElementsVisibilityStatus';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';


import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';

type PageElementsListItemProps = {
  element: PageElement;
  workspaceId: string;
  onVisibilityChange: (visible: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
  draggable: boolean;
};


const PageElementsListItem: FC<PageElementsListItemProps> = ({
  element,
  workspaceId,
  onVisibilityChange,
  onDelete,
  onEdit,
  draggable,
}) => {
  const { selectedWorkspace } = useSelectedWorkspace();
  const elementId = String(element._id);
  
  // Is this specific element marked as prime/protected?
  const isElementPrime = !!element.data?.prime;
  
  // Is the Workspace in Prime Plan?
  const isWorkspacePrime = selectedWorkspace?.plan === 'prime';

  // Can we delete this element?
  // If element is NOT prime -> Always deletable.
  // If element IS prime -> Deletable ONLY if Workspace is Prime.
  const isDeletable = !isElementPrime || isWorkspacePrime;

  // Visibility: Same logic? Usually prime elements are fixed visible. 
  // User asked "ob man Watermark löschen darf". 
  // Let's assume visibility toggle is also restricted if it's protected.
  const isLocked = !isDeletable;

  const visible = element.visible !== false;

  console.log('[PageElementsListItem] render:', {
    id: elementId,
    name: element.name,
    prime: isElementPrime,
    dataPrime: element.data?.prime,
  });

  return (
    <CardRow $draggable={draggable} $hidden={!visible}>
      {/* NAME */}
      <NameCell>{element.name ?? ''}</NameCell>

      {/* Typ */}
      <SlugCell>
        <div className="slug-cell">{element.element}</div>
      </SlugCell>

      <DateCell />

      {/* Sichtbarkeit */}
      <VisibilityCell
        style={{
          opacity: isLocked ? 0.5 : 1,
          pointerEvents: isLocked ? 'none' : 'auto',
        }}
        title={isLocked ? 'Upgrade to Prime to change visibility' : ''}
      >
        <PageElementVisibilityStatus
          value={visible ? 'visible' : 'invisible'}
          onChange={(v) => {
            if (isLocked) return;
            onVisibilityChange(v === 'visible');
          }}
        />
      </VisibilityCell>

      <ActionsCell>
        {/* Bearbeiten */}
        <ActionButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Bearbeiten"
        >
          <Icon name="MdEdit" size={20} aria-hidden />
        </ActionButton>

        {/* Zum Element scrollen */}
        <ActionButton
          $backgroundColor="#caffb2"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent('pe-scroll-to', { detail: { id: elementId } })
            );
          }}
          aria-label="Element in den Viewport scrollen"
        >
          <Icon name="TbViewportShort" size={20} aria-hidden />
        </ActionButton>

        {/* Löschen */}
        <ActionButton
          $backgroundColor="#fee2e2"
          style={{ 
            opacity: isLocked ? 0.3 : 1, 
            cursor: isLocked ? 'not-allowed' : 'pointer', 
            color: '#dc2626' 
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isLocked) {
              alert('Element ist geschützt (Free Plan). Upgrade auf Prime um es zu entfernen.');
              return;
            }
            onDelete();
          }}
          aria-label="Löschen"
        >
          <Icon name="MdDelete" size={20} aria-hidden />
        </ActionButton>
      </ActionsCell>
    </CardRow>
  );
};

export default PageElementsListItem;

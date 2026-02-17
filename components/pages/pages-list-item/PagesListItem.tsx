'use client';

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/content-elements/default';
import PageVisibilityStatus from '@/components/page-visibility-status/PageVisibilityStatus';

import {
  CardRow,
  NameCell,
  SlugCell,
  DateCell,
  VisibilityCell,
  ActionsCell,
  ActionButton,
} from './PagesListItem.styles';
import { highlightSlug } from '../pages-list/utils/highlightSlug';
import Link from 'next/link';
import { PageSummary, PageVisibility } from '@/lib/workspaces/pages/pages.types';

type PagesListItemProps = {
  page: PageSummary;
  workspaceId: string;
  createdAtFormatted: string;
  publishedStatus: PageVisibility;
  onVisibilityChange: (value: PageVisibility) => void;
  onDelete: () => void;
  onDuplicate?: () => Promise<void>;
  onSelect?: () => void;
  slugPillStyle: React.CSSProperties;
  isSelected?: boolean;
  detailed?: boolean;
};

const PagesListItem: FC<PagesListItemProps> = ({
  page,
  workspaceId,
  createdAtFormatted,
  publishedStatus,
  onVisibilityChange,
  onDelete,
  onDuplicate,
  onSelect,
  slugPillStyle,
  isSelected,
  detailed = true,
}) => {
  const pageId = String((page as any)?._id);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Slugs, für die kein SEO-Button angezeigt werden soll (Platzhalter statt Button)
  const NO_SEO_SLUGS = ['404'];

  return (
    <CardRow
      onClick={onSelect}
      style={{ 
        cursor: onSelect ? 'pointer' : 'default',
        border: isSelected ? '2px solid #3b82f6' : undefined 
      }}
    >
      <NameCell>{page.name ?? ''}</NameCell>

      <SlugCell>
        <div className="slug-cell" style={slugPillStyle}>
          {highlightSlug(page.slug || '')}
        </div>
      </SlugCell>

      <DateCell>
        Erstellt am:
        <br />
        {createdAtFormatted}
      </DateCell>

      <VisibilityCell>
        <PageVisibilityStatus
          value={publishedStatus}
          onChange={onVisibilityChange}
        />
      </VisibilityCell>

      <ActionsCell>
        {detailed && (
          <ActionButton
            as={Link}
            href={`/workspaces/${workspaceId}/seiten/${pageId}`}
            aria-label="Bearbeiten"
            onClick={(e: any) => e.stopPropagation()}
          >
            <Icon name="MdEdit" size={20} aria-hidden={true} />
          </ActionButton>
        )}

        {detailed && (
          <ActionButton
            as={Link}
            $backgroundColor="#e7e7e7"
            href={`/workspaces/${workspaceId}/seiten/${pageId}/einstellungen`}
            aria-label="Seiteneinstellungen"
            onClick={(e: any) => e.stopPropagation()}
          >
            <Icon name="MdOutlineSettings" size={20} aria-hidden={true} />
          </ActionButton>
        )}

        {detailed && (
          <ActionButton
            as={Link}
            $backgroundColor="#caffb2"
            href={`/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`}
            aria-label="Seitenelemente"
            onClick={(e: any) => e.stopPropagation()}
          >
            <Icon name="TfiViewList" size={20} aria-hidden={true} />
          </ActionButton>
        )}

        <ActionButton
          as={Link}
          $backgroundColor="#ffd6b0"
          href={`/workspaces/${workspaceId}/seiten/${pageId}/seo`}
          aria-label="SEO Einstellungen"
          style={
            NO_SEO_SLUGS.includes(page.slug || '') ? { visibility: 'hidden' } : {}
          }
          onClick={(e: any) => e.stopPropagation()}
        >
          <Icon name="TbSeo" size={20} aria-hidden={true} />
        </ActionButton>

        <ActionButton
          as={Link}
          $backgroundColor="#d0ecff"
          href={`/workspaces/${workspaceId}/seiten/${pageId}/analyse`}
          aria-label="Analyse"
          style={
            NO_SEO_SLUGS.includes(page.slug || '') ? { visibility: 'hidden' } : {}
          }
          onClick={(e: any) => e.stopPropagation()}
        >
          <Icon name="GrAnalytics" size={20} aria-hidden={true} />
        </ActionButton>

        <DockActionContainer onClick={(e) => e.stopPropagation()}>
          <DockActionButton
            type="button"
            aria-label="Seite duplizieren"
            disabled={isDuplicating}
            onClick={() => {
              if (!onDuplicate) return;
              setIsDuplicating(true);
              onDuplicate().finally(() => setIsDuplicating(false));
            }}
          >
            <Icon name="MdContentCopy" size={18} color="#3b82f6" aria-hidden />
          </DockActionButton>
          <DockActionButton
            type="button"
            aria-label="Seite löschen"
            onClick={onDelete}
          >
            <Icon name="MdDelete" size={18} color="#ef4444" aria-hidden />
          </DockActionButton>
        </DockActionContainer>

        <ActionButton
          $backgroundColor="#9effe2"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/p/${workspaceId}/de/${page.slug || ''}`, '_blank');
          }}
          aria-label="Live-Vorschau"
        >
          <Icon name="MdPreview" size={20} aria-hidden={true} />
        </ActionButton>
      </ActionsCell>
    </CardRow>
  );
};

export default PagesListItem;

const DockActionContainer = styled.div`
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
`;

const DockActionButton = styled.button`
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border-radius: 10px;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

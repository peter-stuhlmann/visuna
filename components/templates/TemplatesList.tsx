'use client';

import React, { FC, useMemo, useState, useTransition, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Icon } from '@/components/content-elements/default';
import { useStatus } from '@/components/status/StatusContext';
import {
  TemplateSummary,
  TemplatePublishStatus as TPS,
} from '@/lib/workspaces/templates/templates.types';
import TemplatePublishStatus from './TemplatePublishStatus';
import TemplatesFilter, { TemplatesFilterState } from './TemplatesFilter';
import { MdContentCopy, MdDelete, MdStar, MdStarOutline } from 'react-icons/md';
import DeleteConfirmModal from '@/components/delete-confirm-modal/DeleteConfirmModal';

type Props = {
  templates: TemplateSummary[];
  workspaceId: string;
  templateType: string;
  templateLabel: string;
  selectedId?: string | null;
  onSelect?: (t: TemplateSummary) => void;
};

/* ---------- helpers ---------- */

function safeLower(s: unknown) {
  return String(s ?? '').toLowerCase();
}

function getTimeOrZero(v: unknown): number {
  const d = new Date(String(v ?? ''));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

const TemplatesList: FC<Props> = ({
  templates: initialTemplates,
  workspaceId,
  templateType,
  templateLabel,
  selectedId,
  onSelect,
}) => {
  const { addStatus } = useStatus();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isPending, startTransition] = useTransition();

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteUsagePages, setDeleteUsagePages] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState<TemplatesFilterState>({
    status: [],
    name: '',
    dateFrom: '',
    dateTo: '',
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [sortColumn, setSortColumn] = useState<string | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sync from parent
  useEffect(() => {
    setTemplates(initialTemplates);
  }, [initialTemplates]);

  // Sync template changes from other components (e.g. AiChat)
  useEffect(() => {
    const handleTemplatesChanged = async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/templates?type=${templateType}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.templates) setTemplates(data.templates);
      } catch {
        // ignore
      }
    };
    window.addEventListener('templates-changed', handleTemplatesChanged);
    return () => window.removeEventListener('templates-changed', handleTemplatesChanged);
  }, [workspaceId, templateType]);

  /* ---------- FILTER ---------- */
  const filteredTemplates = useMemo(() => {
    const list = templates ?? [];

    const fromTime = filters.dateFrom
      ? new Date(filters.dateFrom).getTime()
      : 0;
    const toTime = filters.dateTo
      ? new Date(filters.dateTo).getTime() + 24 * 60 * 60 * 1000 - 1
      : Number.POSITIVE_INFINITY;

    const nameQ = safeLower(filters.name).trim();
    const statusFilter = Array.isArray(filters.status) ? filters.status : [];

    return list.filter((t) => {
      if (statusFilter.length > 0 && !statusFilter.includes(t.publishStatus)) {
        return false;
      }
      if (nameQ && !safeLower(t.name).includes(nameQ)) return false;

      const createdAt = getTimeOrZero(t.createdAt);
      if (createdAt < fromTime) return false;
      if (createdAt > toTime) return false;

      return true;
    });
  }, [templates, filters]);

  /* ---------- SORT ---------- */
  const sortedTemplates = useMemo(() => {
    return filteredTemplates.slice().sort((a, b) => {
      if (!sortColumn) return 0;

      let compA: string | number;
      let compB: string | number;

      if (sortColumn === 'createdAt') {
        compA = getTimeOrZero(a.createdAt);
        compB = getTimeOrZero(b.createdAt);
      } else {
        compA = safeLower((a as any)[sortColumn]);
        compB = safeLower((b as any)[sortColumn]);
      }

      if (compA < compB) return sortDirection === 'asc' ? -1 : 1;
      if (compA > compB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTemplates, sortColumn, sortDirection]);

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.status && filters.status.length > 0) ||
      !!filters.name ||
      !!filters.dateFrom ||
      !!filters.dateTo
    );
  }, [filters]);

  /* ---------- CREATE ---------- */
  const handleCreate = async () => {
    const name = `Neues ${templateLabel}-Template`;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTemplate: TemplateSummary = {
      _id: optimisticId,
      name,
      template: templateType as TemplateSummary['template'],
      workspaceId,
      publishStatus: 'inactive' as TPS,
      createdAt: new Date(),
    };

    // Optimistic: sofort einfügen
    const prevTemplates = templates;
    setTemplates((prev) => [optimisticTemplate, ...prev]);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, template: templateType }),
      });
      if (!res.ok) throw new Error();
      const { template } = await res.json();
      // Ersetze optimistisches Template durch echtes
      setTemplates((prev) =>
        prev.map((t) => (t._id === optimisticId ? template : t))
      );
    } catch {
      setTemplates(prevTemplates);
      addStatus({ type: 'error', message: 'Fehler beim Erstellen.' });
    }
  };

  /* ---------- DELETE (modal flow) ---------- */
  const openDeleteModal = useCallback(async (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteUsagePages([]);
    setIsLoadingUsage(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates/${id}/usage`);
      if (res.ok) {
        const data = await res.json();
        setDeleteUsagePages(data.pages ?? []);
      }
    } catch {
      // Fehler beim Laden der Nutzung ignorieren – Modal trotzdem anzeigen
    } finally {
      setIsLoadingUsage(false);
    }
  }, [workspaceId]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    // Optimistic: sofort entfernen
    const prevTemplates = templates;
    setTemplates((prev) => prev.filter((t) => t._id !== deleteTarget.id));
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
    } catch {
      setTemplates(prevTemplates);
      addStatus({ type: 'error', message: 'Fehler beim Löschen.' });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, templates, workspaceId, addStatus]);

  /* ---------- DUPLICATE ---------- */
  const handleDuplicate = async (id: string) => {
    // Optimistic: Kopie sofort einfügen
    const source = templates.find((t) => t._id === id);
    const optimisticId = `optimistic-dup-${Date.now()}`;
    const optimisticTemplate: TemplateSummary = {
      ...(source ?? {} as TemplateSummary),
      _id: optimisticId,
      name: source ? `${source.name} (Kopie)` : 'Kopie',
      createdAt: new Date(),
    };

    const prevTemplates = templates;
    setTemplates((prev) => [optimisticTemplate, ...prev]);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/templates/${id}/duplicate`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error();
      const { template } = await res.json();
      // Ersetze optimistisches Template durch echtes
      setTemplates((prev) =>
        prev.map((t) => (t._id === optimisticId ? template : t))
      );
    } catch {
      setTemplates(prevTemplates);
      addStatus({ type: 'error', message: 'Fehler beim Duplizieren.' });
    }
  };

  /* ---------- PUBLISH STATUS ---------- */
  const handleStatusChange = async (id: string, publishStatus: TPS) => {
    // Optimistic update
    const prevTemplates = templates;
    setTemplates((prev) =>
      prev.map((t) => (t._id === id ? { ...t, publishStatus } : t))
    );

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback
      setTemplates(prevTemplates);
      addStatus({ type: 'error', message: 'Fehler beim Statuswechsel.' });
    }
  };

  /* ---------- SET DEFAULT (star) ---------- */
  const handleSetDefault = async (id: string) => {
    // Optimistic: set this one as default, unset all others
    const prevTemplates = templates;
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isDefault: t._id === id ? true : false,
      }))
    );

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/templates/${id}/default`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateType }),
        }
      );
      if (!res.ok) throw new Error();
    } catch {
      setTemplates(prevTemplates);
      addStatus({ type: 'error', message: 'Fehler beim Setzen des Standards.' });
    }
  };

  return (
    <ListWrapper>
      {/* QUICK FILTER BAR */}
      <QuickFilterBar>
        <QuickInput
          placeholder={`${templateLabel} durchsuchen…`}
          value={filters.name}
          onChange={(e) =>
            setFilters((f) => ({ ...f, name: e.target.value }))
          }
        />

        <SortSelect
          value={`${sortColumn}-${sortDirection}`}
          onChange={(e) => {
            const [col, dir] = e.target.value.split('-');
            setSortColumn(col);
            setSortDirection(dir as 'asc' | 'desc');
          }}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="createdAt-desc">Neueste zuerst</option>
          <option value="createdAt-asc">Älteste zuerst</option>
        </SortSelect>

        <FilterIconButton
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-label="Filter öffnen"
        >
          {hasActiveFilters ? (
            <Icon name="TbFilterCheck" size={24} />
          ) : (
            <Icon name="TbFilter" size={24} />
          )}
        </FilterIconButton>

        <CreateButton
          onClick={handleCreate}
          type="button"
        >
          <span style={{ display: 'inline-flex', marginRight: 4 }}>
            <Icon name="MdAdd" size={18} />
          </span>
          Erstellen
        </CreateButton>
      </QuickFilterBar>

      {/* FILTER DRAWER */}
      <FilterDrawer $open={filtersOpen}>
        <TemplatesFilter value={filters} onChange={setFilters} />
      </FilterDrawer>

      {/* LIST */}
      <ListContainer>
        {sortedTemplates.length === 0 && (
          <EmptyState>Keine {templateLabel} gefunden.</EmptyState>
        )}
        {sortedTemplates.map((t) => (
          <TemplateRow
            key={t._id}
            $isSelected={t._id === selectedId}
            onClick={() => onSelect?.(t)}
          >
            <NameCell>{t.name}</NameCell>

            <StatusCell onClick={(e) => e.stopPropagation()}>
              <TemplatePublishStatus
                value={t.publishStatus}
                onChange={(val) => handleStatusChange(t._id, val)}
              />
            </StatusCell>

            <ActionsCell onClick={(e) => e.stopPropagation()}>
              <StarButton
                type="button"
                $isDefault={!!t.isDefault}
                data-default={t.isDefault ? 'true' : 'false'}
                aria-label="Als Standard setzen"
                title="Als Standard setzen"
                onClick={() => handleSetDefault(t._id)}
              >
                {t.isDefault ? (
                  <MdStar size={18} color="#f59e0b" />
                ) : (
                  <MdStarOutline size={18} color="#9ca3af" />
                )}
              </StarButton>

              <ActionContainer>
                <ActionButton
                  type="button"
                  aria-label="Template duplizieren"
                  onClick={() => handleDuplicate(t._id)}
                >
                  <MdContentCopy size={16} color="#3b82f6" />
                </ActionButton>
                <ActionButton
                  type="button"
                  aria-label="Template löschen"
                  onClick={() => openDeleteModal(t._id, t.name)}
                >
                  <MdDelete size={16} color="#ef4444" />
                </ActionButton>
              </ActionContainer>
            </ActionsCell>
          </TemplateRow>
        ))}
      </ListContainer>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={`Template "${deleteTarget?.name}" löschen?`}
        message="Dieses Template wird unwiderruflich gelöscht."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      >
        {isLoadingUsage && (
          <UsageInfo>Nutzung wird geprüft…</UsageInfo>
        )}
        {!isLoadingUsage && deleteUsagePages.length > 0 && (
          <UsageWarning>
            <UsageTitle>⚠️ Dieses Template wird auf {deleteUsagePages.length} {deleteUsagePages.length === 1 ? 'Seite' : 'Seiten'} verwendet:</UsageTitle>
            <UsageList>
              {deleteUsagePages.map((p) => (
                <li key={p._id}>
                  <strong>{p.name}</strong>
                  <span style={{ color: '#6b7280', marginLeft: 6, fontSize: 12 }}>/{p.slug}</span>
                </li>
              ))}
            </UsageList>
          </UsageWarning>
        )}
      </DeleteConfirmModal>
    </ListWrapper>
  );
};

export default TemplatesList;

/* ---------- Styles ---------- */

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0 16px;
`;

const QuickFilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;

  @media (max-width: 660px) {
    flex-wrap: wrap;

    & > input {
      flex: 1 1 100%;
    }
  }
`;

const QuickInput = styled.input`
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14px;
  box-sizing: border-box;
`;

const SortSelect = styled.select`
  appearance: none;
  height: 44px;
  flex: 1;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0 36px 0 16px;
  background-color: white;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  cursor: pointer;
  font-size: 14px;
  min-width: 180px;
  box-sizing: border-box;

  @media (max-width: 660px) {
    min-width: 0;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const FilterIconButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const CreateButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #111827;
  color: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-sizing: border-box;

  &:hover {
    background: #1f2937;
  }
`;

const FilterDrawer = styled.div<{ $open: boolean }>`
  overflow: hidden;
  transition: all 0.35s ease;
  max-height: ${(p) => (p.$open ? '600px' : '0')};
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: translateY(${(p) => (p.$open ? '0' : '-8px')});
  margin-bottom: ${(p) => (p.$open ? '20px' : '0')};
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TemplateRow = styled.div<{ $isSelected?: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff;
  border: ${({ $isSelected }) =>
    $isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb'};
  cursor: pointer;
  transition: 0.15s ease;

  &:hover {
    background: rgba(243, 244, 246, 0.5);
  }

  /* Show star on hover/focus-within */
  & ${() => StarButton} {
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover ${() => StarButton},
  &:focus-within ${() => StarButton} {
    opacity: 1;
  }

  /* Always show filled star */
  & ${() => StarButton}[data-default="true"] {
    opacity: 1;
  }
`;

const NameCell = styled.div`
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusCell = styled.div`
  display: flex;
  align-items: center;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const StarButton = styled.button<{ $isDefault: boolean }>`
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border-radius: 8px;
  transition: background 0.15s, opacity 0.15s;
  padding: 0;

  &:hover {
    background: rgba(245, 158, 11, 0.1);
  }
`;

const ActionContainer = styled.div`
  position: relative;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
`;

const ActionButton = styled.button`
  position: relative;
  z-index: 2;
  width: 30px;
  height: 30px;
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

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
`;

const UsageInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  padding: 8px 0;
`;

const UsageWarning = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 12px 14px;
`;

const UsageTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
`;

const UsageList = styled.ul`
  margin: 0;
  padding: 0 0 0 18px;
  font-size: 13px;
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;



'use client';

import React, { ChangeEvent, FC, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddNewPageDialog from './AddNewPageDialog';
import DeleteConfirmModal from '@/components/delete-confirm-modal/DeleteConfirmModal';
import { Button, Icon } from '@/components/content-elements/default';
import { TbLayoutGrid, TbList, TbListDetails, TbLoader2 } from 'react-icons/tb';
import { useStatus } from '@/components/status/StatusContext';

import handlePagePublishStatus from './utils/update-page-publish-status';
import {
  CardsList,
  FilterDrawer,
  FilterIconButton,
  PaginationControls,
  QuickFilterBar,
  QuickInput,
  SortSelect,
  ViewMenu,
  ViewMenuItem,
  GridContainer,
  ListContainer,
  PageCard,
  CardHeader,
  CardTitle,
  CardBody,
  CardRow,
  CardFooter,
  CardActionButton,
  SpinnerContainer,
} from './PagesList.styles';

import PagesListFilters, {
  PagesListFilterState,
} from '@/components/pages-filter/PagesFilter';
import { sampleTemplates } from '@/data/sampleTemplates';
import PagesListItem from '../pages-list-item/PagesListItem';
import Spacer from '@/components/content-elements/default/spacer';
import type { Page, PageSummary, PageVisibility } from '@/lib/workspaces/pages/pages.types';
import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';

type PagesListProps = {
  pagesList?: PageSummary[] | null;
  workspaceId: string;
  selectedPageId?: string | null;
  onPageSelect?: (page: PageSummary, index?: number, previousIndex?: number) => void;
};

export type PublishedStatus = { [slug: string]: PageVisibility };

/* ---------- Styles: Helper ---------- */
const slugPillBaseStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '1rem',
};

function getSlugStyle(slug: string | undefined): React.CSSProperties {
  const s = (slug ?? '').trim();

  let background = 'transparent';
  let color = '#111827';
  let border = '1px solid #e5e7eb';

  switch (s) {
    case 'home':
      background = '#f3f4f6';
      color = '#111827';
      border = '1px solid #e5e7eb';
      break;

    case 'impressum':
    case 'datenschutz':
      background = '#fef9c3';
      color = '#854d0e';
      border = '1px solid #fde68a';
      break;

    case '404':
      background = '#f3f4f6';
      color = '#6b7280';
      border = '1px solid #e5e7eb';
      break;

    default:
      background = 'transparent';
      color = '#000';
      border = 'none';
      break;
  }

  return { background, color, border };
}

function safeLower(s: unknown) {
  return String(s ?? '').toLowerCase();
}

function getTimeOrZero(v: unknown): number {
  const d = new Date(String(v ?? ''));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

/* ---------- Module-level in-memory SWR cache ---------- */
const CACHE_STALE_MS = 30_000; // 30 seconds

type PagesCacheEntry = {
  pages: PageSummary[];
  total: number;
  timestamp: number;
};

const pagesCache = new Map<string, PagesCacheEntry>();

function buildPagesCacheKey(
  workspaceId: string,
  rowsPerPage: number,
  page: number,
  sortColumn: string,
  sortDirection: string,
  filters: PagesListFilterState
): string {
  return JSON.stringify({
    w: workspaceId,
    l: rowsPerPage,
    s: page,
    sc: sortColumn,
    sd: sortDirection,
    fn: filters.name?.trim() || '',
    fs: filters.status || [],
  });
}

const PagesList: FC<PagesListProps> = ({ pagesList, workspaceId, selectedPageId, onPageSelect }) => {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [open, setOpen] = useState(false);
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState<string>('');
  const [isSlugTaken, setIsSlugTaken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  // View Mode Logic
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('list');
  const [isViewInitialized, setIsViewInitialized] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const viewButtonRef = useRef<HTMLDivElement>(null);

  // Load view mode from local storage
  useEffect(() => {
    const savedMode = localStorage.getItem('pages-list-view-mode');
    if (savedMode && ['grid', 'list', 'compact'].includes(savedMode)) {
      setViewMode(savedMode as 'grid' | 'list' | 'compact');
    }
    setIsViewInitialized(true);
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list' | 'compact') => {
    setViewMode(mode);
    setViewMenuOpen(false);
    localStorage.setItem('pages-list-view-mode', mode);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewButtonRef.current && !viewButtonRef.current.contains(event.target as Node)) {
        setViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getViewLabel = () => {
      switch(viewMode) {
          case 'grid': return 'Raster';
          case 'list': return 'Liste';
          case 'compact': return 'Liste Kompakt';
          default: return '';
      }
  };

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);

  const { selectedWorkspace } = useSelectedWorkspace();

  const [publishedStatus, setPublishedStatus] = useState<PublishedStatus>({});

  const [filters, setFilters] = useState<PagesListFilterState>({
    status: [],
    name: '',
    slug: '',
    dateFrom: '',
    dateTo: '',
    author: '',
    workspaceCreatedAt: '',
  });

  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');

  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { addStatus } = useStatus();

  // --- Server-side data fetching with in-memory SWR cache ---
  const fetchPagesFromApi = useCallback(async (opts?: { skipCache?: boolean }) => {
    const cacheKey = buildPagesCacheKey(workspaceId, rowsPerPage, page, sortColumn, sortDirection, filters);

    // If we have cached data and it's still fresh, skip the fetch entirely
    const cached = pagesCache.get(cacheKey);
    if (!opts?.skipCache && cached) {
      const age = Date.now() - cached.timestamp;
      // Show cached data immediately
      setPages(cached.pages);
      setTotalCount(cached.total);
      updatePublishedStatusFromPages(cached.pages);

      // If data is less than 30s old, don't refetch
      if (age < CACHE_STALE_MS) {
        setIsFetching(false);
        return;
      }
      // Otherwise, refetch silently in background (no spinner)
    } else {
      setIsFetching(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', String(rowsPerPage));
      params.set('skip', String(page * rowsPerPage));
      if (sortColumn) params.set('sortBy', sortColumn);
      params.set('sortDir', sortDirection);
      if (filters.name?.trim()) params.set('name', filters.name.trim());
      if (filters.status && filters.status.length > 0) {
        params.set('status', filters.status.join(','));
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/pages?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch pages');
      const data = await res.json();

      const fetchedPages = data.pages ?? [];
      const fetchedTotal = data.total ?? 0;

      // Update cache
      pagesCache.set(cacheKey, { pages: fetchedPages, total: fetchedTotal, timestamp: Date.now() });

      setPages(fetchedPages);
      setTotalCount(fetchedTotal);
      updatePublishedStatusFromPages(fetchedPages);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setIsFetching(false);
    }
  }, [workspaceId, rowsPerPage, page, sortColumn, sortDirection, filters.name, filters.status]);

  const updatePublishedStatusFromPages = (pageList: PageSummary[]) => {
    const newStatus: PublishedStatus = {};
    for (const p of pageList) {
      const s = p.slug || '';
      if (s) newStatus[s] = p.publishStatus ?? 'offline';
    }
    setPublishedStatus(newStatus);
  };

  useEffect(() => {
    fetchPagesFromApi();
  }, [fetchPagesFromApi]);

  // Sync publish status from other components (e.g. PageDockButton)
  useEffect(() => {
    const handleStatusSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      const { pageId, publishStatus: newStatus } = detail;

      setPages(prev =>
        prev.map(p =>
          String(p._id) === String(pageId) ? { ...p, publishStatus: newStatus } as any : p
        )
      );
      setPublishedStatus(prev => {
        const pg = pages.find(p => String(p._id) === String(pageId));
        if (pg?.slug) {
          return { ...prev, [pg.slug]: newStatus };
        }
        return prev;
      });
    };
    window.addEventListener('page-publish-status-change', handleStatusSync);
    return () => window.removeEventListener('page-publish-status-change', handleStatusSync);
  }, [pages]);

  // Sync page deletion from other components (e.g. PageDockButton)
  useEffect(() => {
    const handlePageDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.pageId) return;
      setPages((prev) => prev.filter((p) => p._id !== detail.pageId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    };
    window.addEventListener('page-deleted', handlePageDeleted);
    return () => window.removeEventListener('page-deleted', handlePageDeleted);
  }, []);

  // Sync page creation/duplication from other components (e.g. AiChat)
  useEffect(() => {
    const handlePagesChanged = () => {
      fetchPagesFromApi({ skipCache: true });
    };
    window.addEventListener('pages-changed', handlePagesChanged);
    return () => window.removeEventListener('pages-changed', handlePagesChanged);
  }, [fetchPagesFromApi]);

  // Slug validation for new page dialog
  useEffect(() => {
    if (slug.trim()) {
      const slugExists = pages.some((p) => p.slug === slug);
      setIsSlugTaken(!!slugExists);
      setSlugError(slugExists ? 'Dieser Slug ist bereits vergeben.' : null);
    } else {
      setIsSlugTaken(false);
      setSlugError(null);
    }
  }, [slug, pages]);

  // Reset to page 0 when filters or rowsPerPage change
  useEffect(() => {
    setPage(0);
  }, [filters, rowsPerPage]);

  const handleNewPage = () => {
    setOpen(true);
    setPageName('');
    setSlug('');
    setNameError(null);
    setSlugError(null);
  };

  // Auto-open new page dialog when ?action=new is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleNewPage();
      // Clean up the action param from the URL
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete('action');
      router.replace(`?${sp.toString()}`, { scroll: false });
    }
  }, [searchParams]);

  const handleClose = () => {
    setOpen(false);
    setNameError(null);
    setSlugError(null);
  };

  const handleSave = async () => {
    setNameError(null);
    setSlugError(null);

    if (!workspaceId) {
      addStatus({
        type: 'error',
        message: 'Bitte wähle zuerst einen Workspace aus.',
      });
      return;
    }

    let hasError = false;
    if (!pageName.trim()) {
      setNameError('Seitenname ist erforderlich.');
      hasError = true;
    }
    if (!slug.trim()) {
      setSlugError('Slug ist erforderlich.');
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);

    try {
      // 1) Seite anlegen
      const response = await fetch(`/api/workspaces/${workspaceId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pageName,
          slug,
          workspaceId,
        }),
      });

      if (!response.ok) {
        const errRes = await response.json().catch(() => null);
        throw new Error(errRes?.message || 'Fehler beim Speichern der Seite.');
      }

      const res = await response.json();
      const newPage = res.page;

      if (!newPage || !newPage._id) {
        throw new Error('API hat keine neue Seite zurückgegeben.');
      }

      // 2) Template finden
      const template = sampleTemplates.find((t) => t.id === selectedTemplateId);
      if (!template) throw new Error('Template nicht gefunden');

      // 3) PageElements anlegen (Route erwartet { pageId, element })
      // Automatisch Watermark hinzufügen (nur wenn NICHT Prime!)
      const elementsToCreate = [...(template.elements || [])];

      // Check current plan
      console.log('[PagesList] selectedWorkspace:', selectedWorkspace);
      console.log('[PagesList] plan:', selectedWorkspace?.plan);
      
      if (selectedWorkspace?.plan !== 'prime') {
        elementsToCreate.push({
          element: 'watermark',
          data: { prime: true }, // 🔒 Prime: true (unlöschbar)
        });
      }

      if (elementsToCreate.length > 0) {
        const results = await Promise.all(
          elementsToCreate.map(async (tplEl) => {
            const r = await fetch(
              `/api/workspaces/${workspaceId}/pages/${newPage._id}/page-elements`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pageId: newPage._id,
                  element: tplEl.element,
                  data: JSON.parse(JSON.stringify(tplEl.data || {})),
                  visible: true,
                }),
              }
            );

            if (!r.ok) {
              const errRes = await r.json().catch(() => null);
              throw new Error(
                errRes?.message ||
                  `Fehler beim Erstellen des Elements "${tplEl.element}".`
              );
            }

            return r.json() as Promise<{ id: string }>;
          })
        );
      }

      // 4) Re-fetch pages from server
      await fetchPagesFromApi({ skipCache: true });
      window.dispatchEvent(new Event('pages-changed'));

      addStatus({
        type: 'success',
        message: `Seite "${pageName}" wurde erfolgreich erstellt.`,
      });

      // 5) Neue Seite in der Liste auswählen (nicht weg navigieren)
      if (onPageSelect) {
        onPageSelect(newPage);
      } else {
        const sp = new URLSearchParams(searchParams.toString());
        sp.set('pageId', newPage._id);
        router.replace(`?${sp.toString()}`, { scroll: false });
      }

      handleClose();
    } catch (err) {
      console.error(err);
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback((pageId: string, name: string) => {
    setDeleteTarget({ id: pageId, name });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteTarget(null);

    // Optimistic: sofort entfernen
    const prevPages = pages;
    setPages((prev) => prev.filter((p) => p._id !== deleteTarget.id));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/pages/${deleteTarget.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Fehler beim Löschen der Seite.');

      // Notify other components (e.g. PageDockButton)
      window.dispatchEvent(new CustomEvent('page-deleted', { detail: { pageId: deleteTarget.id } }));

      // If the deleted page is currently being viewed, navigate away
      if (selectedPageId === deleteTarget.id) {
        router.push(`/workspaces/${workspaceId}/seiten`);
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setPages(prevPages);
      setTotalCount((prev) => prev + 1);
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler.',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, workspaceId, addStatus, pages, selectedPageId, router]);

  const handleDuplicate = async (pageId: string) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/pages/${pageId}/duplicate`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Fehler beim Duplizieren der Seite.');

      await fetchPagesFromApi({ skipCache: true });
      window.dispatchEvent(new Event('pages-changed'));
    } catch (err) {
      console.error(err);
      addStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler.',
      });
    }
  };

  const handleVisibilityChange = async (p: PageSummary, newStatus: PageVisibility) => {
    const pageIdStr = p._id;
    const slugKey = p.slug || '';

    const prevStatus: PageVisibility =
      publishedStatus[slugKey] ??
      (p.publishStatus as PageVisibility) ??
      'offline';

    if (newStatus === prevStatus) return;

    // Optimistisch updaten
    setPublishedStatus((prev) => ({ ...prev, [slugKey]: newStatus }));
    setPages((prev) =>
      prev
        ? prev.map((x) =>
            (x.slug || '') === slugKey ? ({ ...x, publishStatus: newStatus } as any) : x
          )
        : prev
    );

    try {
      // ✅ NEUE API-SIGNATUR
      const updatedPage = await handlePagePublishStatus(
        pageIdStr,
        workspaceId,
        newStatus
      );

      setPages((prev) =>
        prev
          ? prev.map((x) =>
              String(x._id) === String(updatedPage._id) ? updatedPage : x
            )
          : prev
      );
    } catch (err) {
      // Rollback
      setPublishedStatus((prev) => ({ ...prev, [slugKey]: prevStatus }));
      setPages((prev) =>
        prev
          ? prev.map((x) =>
              (x.slug || '') === slugKey
                ? ({ ...x, publishStatus: prevStatus } as any)
                : x
            )
          : prev
      );

      addStatus({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Publish-Status konnte nicht gespeichert werden.',
      });
    }
  };

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSort = (column: string | null) => {
    if (!column) return;
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  };

  // Helper for selection
  const handlePageClick = (p: PageSummary, idx?: number) => {
    // Skip if the same page is already selected
    if (selectedPageId === p._id) return;

    if (onPageSelect) {
      const currentIdx = selectedPageId 
          ? pages.findIndex(pg => pg._id === selectedPageId) 
          : -1;
      onPageSelect(p, idx, currentIdx);
      return;
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('pageId', p._id);
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Clamp page if out of range
  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const hasActiveFilters = useMemo(() => {
    return (
      (filters.status && filters.status.length > 0) ||
      !!filters.name ||
      !!filters.slug ||
      !!filters.dateFrom ||
      !!filters.dateTo ||
      !!filters.author
    );
  }, [filters]);

  return (
    <>
      {/* FILTER */}
      {/* QUICK FILTER BAR */}
      <QuickFilterBar>

        {/* ... Input ... */}
        <QuickInput
          placeholder="Seitenname…"
          value={filters.name}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              name: e.target.value,
            }))
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
          <option value="slug-asc">Slug (A-Z)</option>
          <option value="slug-desc">Slug (Z-A)</option>
          <option value="createdAt-desc">Neueste zuerst</option>
          <option value="createdAt-asc">Älteste zuerst</option>
        </SortSelect>
        
        {/* View Toggle */}
        <div style={{ position: 'relative', display: 'flex' }} ref={viewButtonRef}>
            <FilterIconButton 
                type="button"
                onClick={() => setViewMenuOpen(!viewMenuOpen)}
                aria-label="Ansicht ändern"
            >
                {viewMode === 'grid' && <TbLayoutGrid size={24} />}
                {viewMode === 'list' && <TbListDetails size={24} />}
                {viewMode === 'compact' && <TbList size={24} />}
            </FilterIconButton>
            
            <ViewMenu $open={viewMenuOpen}>
                <ViewMenuItem $active={viewMode === 'grid'} onClick={() => handleViewModeChange('grid')}>
                    <TbLayoutGrid size={18} /> Raster
                </ViewMenuItem>
                <ViewMenuItem $active={viewMode === 'list'} onClick={() => handleViewModeChange('list')}>
                    <TbListDetails size={18} /> Liste
                </ViewMenuItem>
                <ViewMenuItem $active={viewMode === 'compact'} onClick={() => handleViewModeChange('compact')}>
                    <TbList size={18} /> Liste Kompakt
                </ViewMenuItem>
            </ViewMenu>
        </div>

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
      </QuickFilterBar>
      <FilterDrawer $open={filtersOpen}>
        <PagesListFilters 
            value={filters} 
            onChange={setFilters} 
            workspaceCreatedAt={(selectedWorkspace as any)?.createdAt} 
        />
      </FilterDrawer>

      <CardsList>
        {!isViewInitialized || isFetching ? (
          <SpinnerContainer>
            <TbLoader2 size={32} />
          </SpinnerContainer>
        ) : pages.length > 0 ? (
          viewMode === 'compact' ? (
          pages
            .map((p, rowIndex) => {
              const absoluteIndex = page * rowsPerPage + rowIndex;
              const createdAtFormatted = (() => {
                const date = new Date((p as any)?.createdAt || '');
                if (Number.isNaN(date.getTime())) return '';

                const datePart = new Intl.DateTimeFormat('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(date);

                const timePart = new Intl.DateTimeFormat('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).format(date);

                return `${datePart} ${timePart}`;
              })();

              return (
                <PagesListItem
                  key={p._id ?? rowIndex}
                  page={p}
                  workspaceId={workspaceId}
                  createdAtFormatted={createdAtFormatted}
                   publishedStatus={publishedStatus[p.slug || ''] ?? 'offline'}
                  onVisibilityChange={(v) => handleVisibilityChange(p, v)}
                  onDelete={() => openDeleteModal(p._id, p.name)}
                  onDuplicate={() => handleDuplicate(p._id)}
                  slugPillStyle={{
                    ...slugPillBaseStyle,
                    ...getSlugStyle(p.slug || ''),
                  }}
                  onSelect={() => handlePageClick(p, absoluteIndex)}
                  isSelected={selectedPageId === p._id}
                  detailed={false}
                />
              );
            })
          ) : (
                /* GRID & LIST VIEW */
                React.createElement(viewMode === 'list' ? ListContainer : GridContainer, {}, 
                    pages
                        .map((p) => (
                            <PageCard 
                              key={p._id} 
                              onClick={() => handlePageClick(p)} 
                              style={{ 
                                cursor: 'pointer',
                                border: selectedPageId === p._id ? '2px solid #3b82f6' : undefined
                              }}
                            >
                                <CardHeader>
                                    <CardTitle>
                                        <div
                                            style={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                backgroundColor: (publishedStatus[p.slug || ''] === 'live') ? '#10b981' : '#d1d5db',
                                            }}
                                            title={ (publishedStatus[p.slug || ''] === 'live') ? 'Online' : 'Offline' }
                                        />
                                        {p.name}
                                    </CardTitle>
                                    
                                </CardHeader>
                                
                                    <CardBody onClick={() => handlePageClick(p)} style={{ cursor: 'pointer' }}>
                                    <CardRow>
                                        <Icon name="TbLink" size={16} />
                                        <span style={{ fontFamily: 'monospace', ...slugPillBaseStyle, ...getSlugStyle(p.slug || '') }}>
                                            /{p.slug}
                                        </span>
                                    </CardRow>
                                    <CardRow>
                                        <Icon name="TbCalendar" size={16} />
                                        {new Date(p.createdAt).toLocaleDateString('de-DE')}
                                    </CardRow>
                                </CardBody>

                                <CardFooter>
                                    <CardActionButton onClick={() => handlePageClick(p)}>
                                        <Icon name="TbEdit" size={16} /> Bearbeiten
                                    </CardActionButton>
                                    <CardActionButton onClick={() => alert('Settings not implemented')}>
                                        <Icon name="TbSettings" size={16} /> Einstellungen
                                    </CardActionButton>
                                    {true && (
                                        <CardActionButton onClick={(e) => { e.stopPropagation(); openDeleteModal(p._id, p.name); }} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                                            <Icon name="TbTrash" size={16} /> Löschen
                                        </CardActionButton>
                                    )}
                                </CardFooter>
                            </PageCard>
                        ))
                )
          )
        ) : (
          <p>Keine Seiten gefunden.</p>
        )}
      </CardsList>

      {totalCount > 10 && (
        <PaginationControls>
          <span>Einträge pro Seite: </span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <span style={{ marginLeft: '20px' }}>
            Seite {page + 1} von {totalPages || 1}
          </span>

          <nav>
            <button onClick={() => handlePageChange(0)} disabled={page === 0}>
              ⏮
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
            >
              ◀
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              ▶
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              ⏭
            </button>
          </nav>
        </PaginationControls>
      )}
      <Spacer data={{ size: 's' }} />
      <Button onClick={handleNewPage}>Neue Seite anlegen</Button>
      <AddNewPageDialog
        isOpen={open}
        handleClose={handleClose}
        pageName={pageName}
        setPageName={setPageName}
        nameError={nameError}
        slugError={slugError}
        slug={slug}
        setSlug={setSlug}
        isSlugTaken={isSlugTaken}
        isLoading={isLoading}
        handleSave={handleSave}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={`Seite "${deleteTarget?.name}" löschen?`}
        message="Diese Seite und alle zugehörigen Seitenelemente werden unwiderruflich gelöscht."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
};

export default PagesList;

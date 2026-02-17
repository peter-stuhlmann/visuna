// components/pages/page-elements/PageElementsList.tsx
'use client';

import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import {
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
} from 'react-icons/md';

import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { usePageElements } from '@/components/usePageElements';
import { useStatus } from '@/components/status/StatusContext';

import type { AllElementData } from '@/components/content-elements/default/types';
import { Page } from '@/lib/workspaces/pages/pages.types';

import ContentElementSettingsWrapper, {
  ContentElementSettingsWrapperHandle,
} from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';

import CreatePageClientWrapper from '@/components/pages/page-elements/components/CreatePageElementsList';

import { useMounted } from './hooks/useMounted';
import { usePageElementsFromPage } from './hooks/usePageElementsFromPage';
import { usePublishStatus } from './hooks/usePublishStatus';
import { usePageElementsDnd } from './hooks/usePageElementsDnd';
import { useDeletePageElement } from './hooks/useDeletePageElement';

import PageElementsTable from './components/PageElementsTable';
import { visunaConfig } from '@/project.config';
import PageVisibilityStatus from '@/components/page-visibility-status/PageVisibilityStatus';
import Link from 'next/link';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';

type PageElementEditProps = {
  page: Page;
  isSplitView?: boolean;
};

type Mode = 'list' | 'create-element' | 'edit-element';

function getModeFromSearchParams(sp: URLSearchParams): Mode {
  const mode = (sp.get('mode') || '').trim();
  if (mode === 'create-element') return 'create-element';
  if (mode === 'edit-element') return 'edit-element';
  return 'list';
}

function getEditIdFromSearchParams(sp: URLSearchParams): string | null {
  const editId = (sp.get('editId') || '').trim();
  return editId || null;
}

const PageElementsList: FC<PageElementEditProps> = ({ page, isSplitView }) => {
  const { addStatus } = useStatus();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMounted = useMounted();

  const {
    pageElements,
    editingPageElementId,
    setEditingPageElementId,
    updatePageElement,
  } = usePageElements();


  // ✅ NEU: direkt aus Page, keine Helper mehr
  const workspaceId = page.workspaceId;
  const pageId = page._id;
  const pageIdRaw = page._id;

  // initiale Serverdaten in Context syncen
  usePageElementsFromPage(page, pageIdRaw);

  const settingsRef = useRef<ContentElementSettingsWrapperHandle>(null);

  const originalRef = useRef<{
    id: string;
    data: AllElementData;
    name?: string;
    visible?: boolean;
  } | null>(null);

  // ---------------------------
  // Mode aus URL
  // ---------------------------
  const mode = useMemo(
    () => getModeFromSearchParams(searchParams),
    [searchParams]
  );

  const editIdFromUrl = useMemo(
    () => getEditIdFromSearchParams(searchParams),
    [searchParams]
  );

  const setUrlState = useCallback(
    (next: {
      mode?: Mode;
      editId?: string | null;
      afterId?: string | null;
    }) => {
      const sp = new URLSearchParams(searchParams.toString());

      if (next.mode !== undefined) {
        if (next.mode && next.mode !== 'list') sp.set('mode', next.mode);
        else sp.delete('mode');
      }

      if (next.editId !== undefined) {
        if (next.editId) sp.set('editId', next.editId);
        else sp.delete('editId');
      }

      if (next.afterId !== undefined) {
        if (next.afterId) sp.set('afterId', next.afterId);
        else sp.delete('afterId');
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const resetToList = useCallback(() => {
    setUrlState({ mode: 'list', editId: null, afterId: null });
  }, [setUrlState]);

  const forceEditMode = useCallback(
    (id: string) => {
      const editId = (id || '').trim();
      if (!editId) return;
      setUrlState({ mode: 'edit-element', editId, afterId: null });
    },
    [setUrlState]
  );

  // ---------------------------
  // Publish toggle
  // ---------------------------
  const { publishedStatus, togglePublish } = usePublishStatus({
    page,
    workspaceId,
    pageId,
  });

  // ---------------------------
  // Delete
  // ---------------------------
  const closeEditState = useCallback(() => {
    setEditingPageElementId(null);
    originalRef.current = null;
  }, [setEditingPageElementId]);

  const { handleDelete } = useDeletePageElement({
    workspaceId,
    pageId,
    editingPageElementId,
    closeModal: () => {
      closeEditState();
      resetToList();
    },
  });

  // ---------------------------
  // DnD
  // ---------------------------
  const { sortableItems, onDragEnd } = usePageElementsDnd({
    workspaceId,
    pageId,
  });

  const goToEdit = useCallback(
    (element: PageElement) => {
      forceEditMode(element._id);

      requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent('pe-scroll-to', {
            detail: { id: element._id },
          })
        );
      });
    },
    [forceEditMode]
  );

  const currentIndex = useMemo(() => {
    if (!editingPageElementId) return -1;
    return pageElements.findIndex((e) => e._id === editingPageElementId);
  }, [pageElements, editingPageElementId]);

  const prevElement = currentIndex > 0 ? pageElements[currentIndex - 1] : null;
  const nextElement =
    currentIndex >= 0 && currentIndex < pageElements.length - 1
      ? pageElements[currentIndex + 1]
      : null;

  const goToPrev = useCallback(() => {
    if (!prevElement) return;
    forceEditMode(prevElement._id);
  }, [prevElement, forceEditMode]);

  const goToNext = useCallback(() => {
    if (!nextElement) return;
    forceEditMode(nextElement._id);
  }, [nextElement, forceEditMode]);

  // ---------------------------
  // URL -> State (Edit)
  // ---------------------------
  useEffect(() => {
    if (mode !== 'edit-element') return;
    if (!editIdFromUrl) return;

    if (editingPageElementId === editIdFromUrl) return;

    const el = pageElements.find((e) => e._id === editIdFromUrl);
    if (!el) return;

    const original =
      typeof structuredClone === 'function'
        ? structuredClone(el.data)
        : JSON.parse(JSON.stringify(el.data));

    originalRef.current = {
      id: el._id,
      data: original,
      name: el.name,
      visible: el.visible,
    };

    setEditingPageElementId(el._id);
  }, [
    mode,
    editIdFromUrl,
    pageElements,
    editingPageElementId,
    setEditingPageElementId,
  ]);

  // Ensure editing state is cleared in list mode
  useEffect(() => {
    if (mode === 'list' && editingPageElementId) {
      setEditingPageElementId(null);
    }
  }, [mode, editingPageElementId, setEditingPageElementId]);

  // ---------------------------
  // Cancel / Save
  // ---------------------------
  const handleCancelEdit = useCallback(() => {
    const snap = originalRef.current;
    if (snap) {
      updatePageElement(snap.id, { name: snap.name, visible: snap.visible });
      updatePageElement(snap.id, { data: snap.data });
    }
    closeEditState();
    resetToList();
    addStatus({ type: 'info', message: 'Daten wurden nicht gespeichert.' });
  }, [addStatus, closeEditState, resetToList, updatePageElement]);

  const handleSaveAndClose = useCallback(async () => {
    const ok = await settingsRef.current?.save();
    if (ok) {
      closeEditState();
      resetToList();
    }
  }, [closeEditState, resetToList]);

  // ---------------------------
  // Create
  // ---------------------------
  const openCreate = useCallback(
    (afterId?: string | null) => {
      setUrlState({
        mode: 'create-element',
        editId: null,
        afterId: afterId ?? null,
      });
    },
    [setUrlState]
  );

  const handleCreated = useCallback(
    (createdId?: string | null) => {
      const id = (createdId || '').trim();
      if (id) {
        forceEditMode(id);
        return;
      }
      resetToList();
    },
    [forceEditMode, resetToList]
  );

  // ---------------------------
  // Render
  // ---------------------------

  if (mode === 'create-element') {
    return (
      <>
        {!isSplitView && (
          <Breadcrumbs
            data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
            },
            currentLanguage: 'de',
            links: [
              {
                label: { de: 'Dashboard', en: 'Dashboard' },
                href: {
                  de: `/workspaces/${workspaceId}/dashboard`,
                  en: `/workspaces/${workspaceId}/dashboard`,
                },
                highlighted: false,
              },
              {
                label: { de: 'Seiten', en: 'Seiten' },
                href: {
                  de: `/workspaces/${workspaceId}/seiten`,
                  en: `/workspaces/${workspaceId}/seiten`,
                },
                highlighted: false,
              },
              {
                label: {
                  de: `Seite "${page.name}"`,
                  en: `Page "${page.name}"`,
                },
                href: {
                  de: `/workspaces/${workspaceId}/seiten/${pageId}`,
                  en: `/workspaces/${workspaceId}/seiten/${pageId}`,
                },
                highlighted: false,
              },
              {
                label: { de: `Seitenelemente`, en: `Page Elements` },
                href: {
                  de: `/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`,
                  en: `/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`,
                },
                highlighted: false,
              },
              {
                label: {
                  de: 'Seitenelement erstellen',
                  en: 'Create Page Element',
                },
                highlighted: true,
              },
            ],
          }}
        />
        )}
        <Wrapper
          data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
            },
            children: (
              <>
                <Heading value="Seitenelement erstellen" element="h2" />

                <CreatePageClientWrapper
                  workspaceId={workspaceId}
                  pageId={pageId}
                  onCreated={handleCreated as any}
                />
              </>
            ),
          }}
        />
      </>
    );
  }

  if (mode === 'edit-element') {
    return (
      <>
        {!isSplitView && (
          <Breadcrumbs
            data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
            },
            currentLanguage: 'de',
            links: [
              {
                label: { de: 'Dashboard', en: 'Dashboard' },
                href: {
                  de: `/workspaces/${workspaceId}/dashboard`,
                  en: `/workspaces/${workspaceId}/dashboard`,
                },
                highlighted: false,
              },
              {
                label: { de: 'Seiten', en: 'Seiten' },
                href: {
                  de: `/workspaces/${workspaceId}/seiten`,
                  en: `/workspaces/${workspaceId}/seiten`,
                },
                highlighted: false,
              },
              {
                label: {
                  de: `Seite "${page.name}"`,
                  en: `Page "${page.name}"`,
                },
                href: {
                  de: `/workspaces/${workspaceId}/seiten/${pageId}`,
                  en: `/workspaces/${workspaceId}/seiten/${pageId}`,
                },
                highlighted: false,
              },
              {
                label: { de: `Seitenelemente`, en: `Page Elements` },
                href: {
                  de: `/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`,
                  en: `/workspaces/${workspaceId}/seiten/${pageId}/seitenelemente`,
                },
                highlighted: false,
              },
              {
                label: {
                  de: 'Seitenelement bearbeiten',
                  en: 'Edit Page Elements',
                },
                highlighted: true,
              },
            ],

          }}
        />
        )}
        <Wrapper
          data={{
            layout: {
              outerWidth: 'full',
              innerWidth: 'xl',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
            },
            children: (
              <>
                <Heading value="Seitenelement bearbeiten" element="h1" />

                <NavBar>
                  <NavBtn
                    type="button"
                    onClick={goToPrev}
                    disabled={!prevElement}
                  >
                    <MdChevronLeft size={18} />
                    <span>Voriges</span>
                  </NavBtn>
                  <CreateBtn
                    type="button"
                    onClick={() => {
                      if (currentIndex > 0 && prevElement) {
                        openCreate(prevElement._id);
                      } else {
                        openCreate(null);
                      }
                    }}
                  >
                    <MdAdd size={16} />
                    <span>Davor einfügen</span>
                  </CreateBtn>
                  <NavDivider />
                  <CreateBtn
                    type="button"
                    onClick={() => {
                      if (editingPageElementId) {
                        openCreate(editingPageElementId);
                      }
                    }}
                  >
                    <MdAdd size={16} />
                    <span>Danach einfügen</span>
                  </CreateBtn>
                  <NavBtn
                    type="button"
                    onClick={goToNext}
                    disabled={!nextElement}
                  >
                    <span>Nächstes</span>
                    <MdChevronRight size={18} />
                  </NavBtn>
                </NavBar>

                {!editingPageElementId ? (
                  <div style={{ marginTop: 8, color: '#6b7280' }}>
                    Lade Element…
                  </div>
                ) : (
                  <ContentElementSettingsWrapper
                    ref={settingsRef}
                    handleCloseModal={handleSaveAndClose}
                    onCancel={handleCancelEdit}
                    pageId={pageId}
                    workspaceId={workspaceId}
                  />
                )}
              </>
            ),
          }}
        />
      </>
    );
  }

  // LIST (default)
  return (
    <>
      {!isSplitView && (
        <Breadcrumbs
          data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          currentLanguage: 'de',
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Seiten', en: 'Seiten' },
              href: {
                de: `/workspaces/${workspaceId}/seiten`,
                en: `/workspaces/${workspaceId}/seiten`,
              },
              highlighted: false,
            },
            {
              label: { de: `Seite "${page.name}"`, en: `Page "${page.name}"` },
              href: {
                de: `/workspaces/${workspaceId}/seiten/${pageId}`,
                en: `/workspaces/${workspaceId}/seiten/${pageId}`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Seitenelemente', en: 'Page Elements' },
              highlighted: true,
            },
          ],
        }}
        />
      )}

      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <StyledHeading>Seitenelemente</StyledHeading>
              <StyledPageName>{page.name}</StyledPageName>

              <PageVisibilityBar>
                <div>
                  <strong>Status:</strong>
                </div>

                <PageVisibilityStatus
                  value={publishedStatus}
                  onChange={(v) => togglePublish(v)}
                />

                <PageLink
                  href={`/${visunaConfig.projectsSlug}/${workspaceId}/de/${page.slug}`}
                  target="_blank"
                >
                  Seite öffnen ↗
                </PageLink>
              </PageVisibilityBar>

              <div style={{ marginTop: '1rem' }}>
                <PageElementsTable
                  isMounted={isMounted}
                  pageElements={pageElements}
                  sortableItems={sortableItems}
                  onDragEnd={onDragEnd}
                  onEdit={goToEdit}
                  onDelete={handleDelete}
                  onInsertAfter={(afterId) => openCreate(afterId)}
                  workspaceId={workspaceId}
                />
                {/* 
                <Button onClick={() => openCreate(null)}>
                  {pageElements.length > 0 && 'Weiteres'} Seitenelement
                  hinzufügen
                </Button> */}
              </div>
            </>
          ),
        }}
      />
    </>
  );
};

export default PageElementsList;

const StyledHeading = styled.h1`
  font-size: 16px;
  letter-spacing: 0.05em;
  font-weight: bold;
  text-transform: uppercase !important;
  margin: 0;
`;

const StyledPageName = styled.div`
  font-size: 28px;
  font-weight: bold;
`;

const PageVisibilityBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0 24px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

const PageLink = styled(Link)`
  margin-left: auto;
  text-decoration: none;
  color: inherit;
  letter-spacing: 0.01em;

  &:hover {
    text-decoration: underline;
  }
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: #f8f9fb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
`;

const NavDivider = styled.div`
  flex: 1;
  height: 1px;
  background: #e5e7eb;
  min-width: 8px;
`;

const NavBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e0e3e8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);

  &:hover:not(:disabled) {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    box-shadow: 0 2px 8px rgba(59,130,246,0.25);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    background: #f3f4f6;
    border-color: #e5e7eb;
  }
`;

const CreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 6px 12px;
  background: transparent;
  border: 1px dashed #c7ccd4;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }
`;

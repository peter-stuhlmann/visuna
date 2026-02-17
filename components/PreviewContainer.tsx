// components/PreviewContainer.tsx
'use client';

import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useId,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styled, { createGlobalStyle } from 'styled-components';
import {
  MdGridOn,
  MdGridOff,
  MdVisibility,
  MdVisibilityOff,
  MdEdit,
  MdWarning,
  MdDelete,
  MdAdd,
  MdArrowUpward,
  MdArrowDownward,
  MdDragIndicator,
  MdChevronLeft,
  MdChevronRight,
  MdContentCopy,
} from 'react-icons/md';
import { TbLoader2 } from 'react-icons/tb';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import PageDockButton from './page-dock-button/PageDockButton';

import { useClientStorage } from './content-elements/default/utils/useLocalStorage';
import { usePageElements } from './usePageElements';
import { useDeletePageElement } from './pages/page-elements/hooks/useDeletePageElement';
import { usePersistPageElementVisibility } from './pages/page-elements/hooks/usePersistPageElementVisibility';
import { usePersistPageElementsOrder } from './pages/page-elements/hooks/usePersistPageElementsOrder';
import { usePage } from './PageContext';
import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';
import { useElementApi } from '@/components/ElementApiContext';
import PageElementVisibilityStatus from './page-elements-visibility-status/PageElementsVisibilityStatus';
import PageElementMapper from '@/app/p/[workspaceId]/[locale]/utils/PageElementMapper';
import {
  DEFAULT_LANGUAGES,
  type LanguageCode,
} from './language-settings/languages';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import { Button } from './content-elements/default';
import LanguageSwitcher from './language-switcher/LanguageSwitcher';
import { useExternalPreview } from './ExternalPreviewContext';
import type { ResolutionConfig } from './resolution-switcher/ResolutionSwitcher';
import ResolutionSwitcher, { getResolution } from './resolution-switcher/ResolutionSwitcher';

type PreviewContainerProps = {
  pageElements: PageElement[];
  /** Content-Management-Sprachen des Workspaces (z.B. [DEFAULT_LANGUAGES[0], 'en', 'es']) */
  availableLanguages: LanguageCode[];
  onEnsureEditVisible?: () => void;
  /** Called when language is changed (for cross-window sync) */
  onLanguageChange?: (lang: LanguageCode) => void;
  /** Wenn true, werden Header/Footer-Templates geladen und mit <header>/<main>/<footer> gerendert */
  isPagePreview?: boolean;
};

const escapeCss = (value: string) => value.replace(/["\\]/g, '\\$&');

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement || null;
  while (node) {
    const style = getComputedStyle(node);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight;
    if (isScrollable) return node;
    node = node.parentElement;
  }
  return document.scrollingElement as HTMLElement | null;
}

function scrollIntoViewWithin(
  container: HTMLElement,
  el: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
) {
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const offset = eRect.top - cRect.top;
  const delta = offset - (container.clientHeight / 2 - eRect.height / 2);
  const target = container.scrollTop + delta;
  container.scrollTo({ top: target, behavior });
}

/* -------------------------------------------------------------------------------------------------
 * FloatingButtonGroup: Renders element buttons at position:fixed when inside a device viewport,
 * so they can overflow outside the scroll container's clipping bounds.
 * ------------------------------------------------------------------------------------------------- */
const FloatingButtonGroup: FC<{
  className?: string;
  controlsExpanded: boolean;
  children: React.ReactNode;
}> = ({ className, controlsExpanded, children }) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isInsideViewport, setIsInsideViewport] = useState(false);
  const [fixedPos, setFixedPos] = useState<{ top: number; right: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Detect if inside a device viewport on mount
  useEffect(() => {
    if (!anchorRef.current) return;
    const viewport = anchorRef.current.closest('[data-device-viewport]');
    setIsInsideViewport(!!viewport);
  }, []);

  // Show when parent .page-element is hovered or in touch mode
  useEffect(() => {
    if (!anchorRef.current) return;
    const pageEl = anchorRef.current.closest('.page-element') as HTMLElement | null;
    if (!pageEl) return;

    // Check if simulate-touch (always visible)
    const viewport = anchorRef.current.closest('[data-device-viewport]');
    if (viewport?.classList.contains('simulate-touch')) {
      setIsVisible(true);
      return;
    }

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);
    pageEl.addEventListener('mouseenter', onEnter);
    pageEl.addEventListener('mouseleave', onLeave);
    return () => {
      pageEl.removeEventListener('mouseenter', onEnter);
      pageEl.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Update fixed position when visible and inside viewport
  useLayoutEffect(() => {
    if (!isInsideViewport || !isVisible || !anchorRef.current) {
      setFixedPos(null);
      return;
    }

    const pageEl = anchorRef.current.closest('.page-element') as HTMLElement | null;
    const viewport = anchorRef.current.closest('[data-device-viewport]') as HTMLElement | null;
    if (!pageEl || !viewport) return;

    const update = () => {
      const pageRect = pageEl.getBoundingClientRect();
      const vpRect = viewport.getBoundingClientRect();

      // The toggle button sits at top:8 + right:8 inside the page-element.
      // Hide the entire button group if the toggle button's position
      // is outside the device viewport vertically.
      const buttonTop = pageRect.top + 8;
      const buttonBottom = buttonTop + 32; // approximate toggle button height
      const isToggleInView = buttonTop >= vpRect.top && buttonBottom <= vpRect.bottom;
      if (!isToggleInView) {
        setFixedPos(null);
        return;
      }

      setFixedPos({
        top: pageRect.top + 8,
        right: window.innerWidth - pageRect.right + 8,
      });
    };

    update();
    viewport.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    return () => {
      viewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isInsideViewport, isVisible, controlsExpanded]);

  // If not in a device viewport, use regular absolute CollapsibleButtonGroup
  if (!isInsideViewport) {
    return (
      <CollapsibleButtonGroup ref={anchorRef} className={className}>
        {children}
      </CollapsibleButtonGroup>
    );
  }

  // Render a zero-size anchor + portal the buttons to document.body
  return (
    <>
      {/* Invisible anchor to detect position & viewport */}
      <div ref={anchorRef} style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0 }} />
      {typeof document !== 'undefined' && createPortal(
        <div
          className={className}
          style={{
            position: 'fixed',
            top: fixedPos ? `${fixedPos.top}px` : '-9999px',
            right: fixedPos ? `${fixedPos.right}px` : '-9999px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            opacity: isVisible && fixedPos ? 1 : 0,
            pointerEvents: isVisible && fixedPos ? 'auto' : 'none',
            transform: isVisible && fixedPos ? 'translateY(0)' : 'translateY(-2px)',
            transformOrigin: 'top right',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PreviewElementWrapper: Component to encapsulate the item logic and hooks.
 * This MUST be a component so that we can use hooks (context, router, etc.)
 * ------------------------------------------------------------------------------------------------- */
const PreviewElementWrapper: FC<{
  element: PageElement;
  children: ReactNode;
  highlightedId: string | null;
  onEnsureEditVisible?: () => void;
  index: number;
  totalCount: number;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  controlsExpanded: boolean;
  setControlsExpanded: (v: boolean) => void;
  onDuplicate: (element: PageElement) => void;
}> = ({ 
  element: el, 
  children: node, 
  highlightedId, 
  onEnsureEditVisible,
  index,
  totalCount,
  moveUp,
  moveDown,
  controlsExpanded,
  setControlsExpanded,
  onDuplicate,
}) => {
  // Sortable Hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(el._id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0 : 1, // Completely hide original
    height: isDragging ? 0 : 'auto', // Collapse height
    margin: isDragging ? 0 : undefined,
    borderTop: isDragging ? '4px solid #2563eb' : 'none', // Blue Line Indicator
    // overflow: 'hidden', // REMOVED to allow "ELEMENT ANFANG/ENDE" labels to pop out
  };

  // Hooks for actions
  const { page } = usePage();
  const { removePageElement, updatePageElement, editingPageElementId: editingElementId } = usePageElements();
  const { persistVisibility } = usePersistPageElementVisibility(
    page?.workspaceId ?? '',
    page?._id ?? ''
  );
  
  const { selectedWorkspace } = useSelectedWorkspace();
  const isElementPrime = !!el.data?.prime;
  const isWorkspacePrime = selectedWorkspace?.plan === 'prime';
  const isDeletable = !isElementPrime || isWorkspacePrime;
  const isLocked = !isDeletable;
  // ... rest of imports ...
  
  const isEditing = String(el._id) === String(editingElementId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isExternal } = useExternalPreview();

  const { handleDelete } = useDeletePageElement({
    pageId: page?._id ?? '',
    workspaceId: page?.workspaceId ?? '',
    editingPageElementId: editingElementId,
    closeModal: () => {
      // If we are editing the deleted element, go back to list
      if (isEditing) {
        const sp = new URLSearchParams(searchParams.toString());
        sp.delete('mode');
        sp.delete('editId');
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      }
    },
  });

  const { pageElements } = usePageElements();
  const effectiveElements = pageElements; 

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isEditing) return;

    if (isExternal) {
      // In external preview: broadcast edit request to main editor
      const channel = new BroadcastChannel('preview-sync');
      channel.postMessage({ type: 'edit-element', editId: el._id });
      channel.close();
      return;
    }

    if (typeof onEnsureEditVisible === 'function') {
      onEnsureEditVisible();
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('mode', 'edit-element');
    sp.set('editId', el._id);
    sp.delete('afterId');

    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDuplicate(el);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isLocked) {
      alert('Element ist geschützt (Free Plan). Upgrade auf Prime um es zu entfernen.');
      return;
    }
    
    if (confirm('Möchten Sie dieses Element wirklich löschen?')) {
      handleDelete(el._id);
    }
  };

  // Create Helpers
  const handleCreateBefore = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const idx = effectiveElements.findIndex((x) => x._id === el._id);
    let afterId: string | null = null;
    if (idx > 0) {
      afterId = effectiveElements[idx - 1]._id;
    }

    if (isExternal) {
      const channel = new BroadcastChannel('preview-sync');
      channel.postMessage({ type: 'create-element', afterId });
      channel.close();
      return;
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('mode', 'create-element');
    sp.delete('editId');
    if (afterId) sp.set('afterId', afterId);
    else sp.delete('afterId'); 
    
    if (typeof onEnsureEditVisible === 'function') {
      onEnsureEditVisible();
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const handleCreateAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isExternal) {
      const channel = new BroadcastChannel('preview-sync');
      channel.postMessage({ type: 'create-element', afterId: el._id });
      channel.close();
      return;
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('mode', 'create-element');
    sp.delete('editId');
    sp.set('afterId', el._id);

    if (typeof onEnsureEditVisible === 'function') {
      onEnsureEditVisible();
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const handleVisibilityChange = async (visible: boolean) => {
    if (isLocked) return;
    const currentVisible = el.visible !== false;
    if (visible === currentVisible) return;

    updatePageElement(el._id, { visible });

    // Direct broadcast for cross-window visibility sync
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'visibility-change', elementId: el._id, visible });
    channel.close();

    const ok = await persistVisibility(el._id, page?._id ?? '', visible);
    if (!ok) {
      updatePageElement(el._id, { visible: currentVisible });
      // Broadcast revert too
      const ch2 = new BroadcastChannel('preview-sync');
      ch2.postMessage({ type: 'visibility-change', elementId: el._id, visible: currentVisible });
      ch2.close();
    }
  };

  const isHighlighted = String(el._id) === String(highlightedId);
  const showMarking = isEditing || isHighlighted;
  const visibilityValue = el.visible !== false ? 'visible' : 'invisible';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`page-element${showMarking ? ' is-editing' : ''}`}
      data-id={el._id}
      data-elkey={el.element}
    >
      {showMarking && (
        <div 
          className="helper-grid" 
          data-label={` | Bearbeitungsmodus`}
          style={{ '--status-color': el.visible !== false ? '#10b981' : '#ef4444' } as React.CSSProperties}
        />
      )}

      {/* Hover-Buttons-Group — uses fixed positioning to overflow outside device viewport */}
      <FloatingButtonGroup
        className="preview-edit-btn"
        controlsExpanded={controlsExpanded}
      >
        <ExpandedContent $expanded={controlsExpanded}>
          {/* Primary actions: Edit, Delete, Duplicate, Visibility */}
          <div className="toolbar-primary" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <ElementActionContainer>
              {!isElementPrime && (
                <ElementActionButton
                  type="button"
                  onClick={handleDuplicateClick}
                  title="Element duplizieren"
                >
                  <MdContentCopy size={16} color="#3b82f6" />
                </ElementActionButton>
              )}
              <ElementActionButton
                type="button"
                onClick={handleDeleteClick}
                title={isLocked ? "Element ist geschützt (Prime)" : "Element löschen"}
                style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <MdDelete size={18} color="#ef4444" />
              </ElementActionButton>
            </ElementActionContainer>

            <div onClick={(e) => e.stopPropagation()} style={isLocked ? { opacity: 0.5, pointerEvents: 'none' } : undefined} title={isLocked ? "Element ist geschützt (Prime)" : ""}>
              <PageElementVisibilityStatus
                value={visibilityValue}
                onChange={(val) => handleVisibilityChange(val === 'visible')}
              />
            </div>

            <EditButton
              type="button"
              onClick={handleEditClick}
              title="Element bearbeiten"
            >
              <MdEdit size={16} />
              <span>Bearbeiten</span>
            </EditButton>
          </div>

          {/* Secondary actions: Reorder + Create */}
          <div className="toolbar-secondary" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Reorder Group */}
            <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #ddd', paddingRight: 8, marginRight: 4 }}>
               {index > 0 && (
                 <CreateButton type="button" onClick={(e) => { e.stopPropagation(); moveUp(el._id); }} title="Nach oben verschieben">
                    <MdArrowUpward size={14} />
                 </CreateButton>
               )}
               {index < totalCount - 1 && (
                 <CreateButton type="button" onClick={(e) => { e.stopPropagation(); moveDown(el._id); }} title="Nach unten verschieben">
                    <MdArrowDownward size={14} />
                 </CreateButton>
               )}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <CreateButton
                type="button"
                onClick={handleCreateBefore}
                title="Neues Element davor einfügen"
              >
                <MdAdd style={{ transform: 'rotate(180deg)' }} />
                <span style={{ fontSize: 10, marginLeft: -2 }}>↑</span>
              </CreateButton>
              <CreateButton
                type="button"
                onClick={handleCreateAfter}
                title="Neues Element danach einfügen"
              >
                <MdAdd />
                <span style={{ fontSize: 10, marginLeft: -2 }}>↓</span>
              </CreateButton>
            </div>
          </div>
        </ExpandedContent>

        <ToggleButton 
          onClick={(e) => { e.stopPropagation(); setControlsExpanded(!controlsExpanded); }}
          $expanded={controlsExpanded}
          title={controlsExpanded ? "Einklappen" : "Menü ausklappen"}
        >
          {controlsExpanded ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
        </ToggleButton>
      </FloatingButtonGroup>

      {node}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PreviewContainer
 * ------------------------------------------------------------------------------------------------- */
const PreviewContainer: FC<PreviewContainerProps> = ({
  pageElements,
  availableLanguages,
  onEnsureEditVisible,
  onLanguageChange,
  isPagePreview = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledIdRef = useRef<string | null>(null);
  const hoveredElRef = useRef<HTMLDivElement | null>(null);

  const dndContextId = useId();

  // Hooks for ordering
  const { page } = usePage();
  const {
    pageElements: ctxElements,
    editingPageElementId: editingElementId,
    reorderByIds,
    setPageElements,
  } = usePageElements();
  
  const { persistOrder } = usePersistPageElementsOrder(
    page?.workspaceId ?? '',
    page?._id ?? ''
  );
  const api = useElementApi(page?.workspaceId ?? '', page?._id ?? '');
  
  // ... DnD Sensors ...
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // workspaceId aus Page-Kontext oder URL extrahieren
  const workspaceIdFromUrl = pathname?.match(/\/workspaces\/([^/]+)/)?.[1] ?? '';
  const tplWorkspaceId = page?.workspaceId || workspaceIdFromUrl;

  // Window-level cache for template data (survives AnimatePresence remount)
  const tplCache = typeof window !== 'undefined' ? ((window as any).__tplCache ??= {}) : {};
  const cached = tplCache[tplWorkspaceId] as {
    headerElements: PageElement[];
    footerElements: PageElement[];
    headerList: { _id: string; name: string; isDefault?: boolean }[];
    footerList: { _id: string; name: string; isDefault?: boolean }[];
    selectedHeaderId: string;
    selectedFooterId: string;
  } | undefined;

  // Header/footer template elements for preview
  const [headerElements, setHeaderElements] = useState<PageElement[]>(cached?.headerElements ?? []);
  const [footerElements, setFooterElements] = useState<PageElement[]>(cached?.footerElements ?? []);
  const [templatesLoading, setTemplatesLoading] = useState(!cached);
  const [headerTemplatesList, setHeaderTemplatesList] = useState<{ _id: string; name: string; isDefault?: boolean }[]>(cached?.headerList ?? []);
  const [footerTemplatesList, setFooterTemplatesList] = useState<{ _id: string; name: string; isDefault?: boolean }[]>(cached?.footerList ?? []);
  const [selectedHeaderId, setSelectedHeaderId] = useState(cached?.selectedHeaderId ?? '');
  const [selectedFooterId, setSelectedFooterId] = useState(cached?.selectedFooterId ?? '');
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);

  // Hilfsfunktion: Template-Elemente per ID laden
  const fetchTemplateById = useCallback(async (wId: string, templateId: string): Promise<PageElement[]> => {
    try {
      const res = await fetch(`/api/workspaces/${wId}/templates/${templateId}`);
      if (!res.ok) return [];
      const data = await res.json();
      const els = Array.isArray(data.template?.data) ? data.template.data : [];
      return els.map((el: any) => ({ ...el, visible: true }));
    } catch { return []; }
  }, []);

  // Initial: Default-Templates + Template-Listen laden (skip if cached)
  useEffect(() => {
    if (!isPagePreview || !tplWorkspaceId) { setTemplatesLoading(false); return; }
    // If cached, skip fetch entirely
    if (tplCache[tplWorkspaceId]) { setTemplatesLoading(false); return; }
    const loadAll = async () => {
      try {
        const [defaultsRes, headerListRes, footerListRes] = await Promise.all([
          fetch(`/api/workspaces/${tplWorkspaceId}/templates/defaults`),
          fetch(`/api/workspaces/${tplWorkspaceId}/templates?type=header`),
          fetch(`/api/workspaces/${tplWorkspaceId}/templates?type=footer`),
        ]);
        const forceVisible = (els: any[]) => els.map((el: any) => ({ ...el, visible: true }));
        let hEls: PageElement[] = [], fEls: PageElement[] = [];
        let hList: any[] = [], fList: any[] = [];
        let selH = '', selF = '';
        if (defaultsRes.ok) {
          const data = await defaultsRes.json();
          hEls = Array.isArray(data.headerElements) ? forceVisible(data.headerElements) : [];
          fEls = Array.isArray(data.footerElements) ? forceVisible(data.footerElements) : [];
          setHeaderElements(hEls);
          setFooterElements(fEls);
        }
        if (headerListRes.ok) {
          const data = await headerListRes.json();
          hList = data.templates ?? [];
          setHeaderTemplatesList(hList);
          const def = hList.find((t: any) => t.isDefault);
          selH = def?._id ?? hList[0]?._id ?? '';
          if (selH) setSelectedHeaderId(selH);
        }
        if (footerListRes.ok) {
          const data = await footerListRes.json();
          fList = data.templates ?? [];
          setFooterTemplatesList(fList);
          const def = fList.find((t: any) => t.isDefault);
          selF = def?._id ?? fList[0]?._id ?? '';
          if (selF) setSelectedFooterId(selF);
        }
        // Cache for future mounts
        tplCache[tplWorkspaceId] = {
          headerElements: hEls, footerElements: fEls,
          headerList: hList, footerList: fList,
          selectedHeaderId: selH, selectedFooterId: selF,
        };
      } catch {}
      // DEBUG: 10s extra delay for testing
      await new Promise(r => setTimeout(r, 100));
      setTemplatesLoading(false);
    };
    loadAll();
  }, [tplWorkspaceId, isPagePreview]);

  // Auf Template-Wechsel aus dem PageDock reagieren
  useEffect(() => {
    if (!isPagePreview) return;
    const handleHeaderChange = (e: Event) => {
      const { templateId, workspaceId: wId } = (e as CustomEvent).detail;
      if (templateId && wId) fetchTemplateById(wId, templateId).then(setHeaderElements);
    };
    const handleFooterChange = (e: Event) => {
      const { templateId, workspaceId: wId } = (e as CustomEvent).detail;
      if (templateId && wId) fetchTemplateById(wId, templateId).then(setFooterElements);
    };
    window.addEventListener('preview-header-template-change', handleHeaderChange);
    window.addEventListener('preview-footer-template-change', handleFooterChange);
    return () => {
      window.removeEventListener('preview-header-template-change', handleHeaderChange);
      window.removeEventListener('preview-footer-template-change', handleFooterChange);
    };
  }, [isPagePreview, fetchTemplateById]);

  const languages: LanguageCode[] = useMemo(() => {
    if (!availableLanguages?.length) return [DEFAULT_LANGUAGES[0]] as LanguageCode[];
    const unique = Array.from(new Set(availableLanguages));
    // Main language (first) stays first, rest sorted alphabetically
    const main = unique[0];
    const rest = unique.slice(1).sort((a, b) => a.localeCompare(b));
    return [main, ...rest];
  }, [availableLanguages]);

  const [currentLanguage, setCurrentLanguage] = useClientStorage<LanguageCode>(
    'preview-language',
    DEFAULT_LANGUAGES[0], // Fixed default to ensure localStorage loads correctly
    'local'
  );
  const [dimensions, setDimensions] = useClientStorage<{ width: number; height: number }>(
    'preview-dimensions',
    { width: 0, height: 0 },
    'local'
  );
  
  // Ensure currentLanguage is valid for the current workspace
  useEffect(() => {
    if (languages.length > 0 && !languages.includes(currentLanguage)) {
      setCurrentLanguage(languages[0]);
    }
  }, [languages, currentLanguage, setCurrentLanguage]);

  // Listen for remote language changes (from main editor, external preview, or PageDock)
  useEffect(() => {
    const onRemoteLang = (e: Event) => {
      const lang = (e as CustomEvent<{ language: LanguageCode }>).detail?.language;
      if (lang && languages.includes(lang)) {
        setCurrentLanguage(lang);
      }
    };
    window.addEventListener('preview-language-change', onRemoteLang as EventListener);

    // Also listen for BroadcastChannel messages directly from external preview
    const channel = new BroadcastChannel('preview-sync');
    const onMessage = (event: MessageEvent) => {
      const { type } = event.data;
      if (type === 'language-change-from-external' || type === 'language-change') {
        const { language } = event.data;
        if (language && languages.includes(language)) {
          setCurrentLanguage(language);
        }
      }
    };
    channel.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('preview-language-change', onRemoteLang as EventListener);
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, [languages, setCurrentLanguage]);

  // Wrapped setter that also notifies parent and all listeners (cross-window + same-window sync)
  const handleSetLanguage = useCallback((lang: LanguageCode) => {
    setCurrentLanguage(lang);
    onLanguageChange?.(lang);
    // Direct BroadcastChannel broadcast for cross-window sync (works even without onLanguageChange prop)
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'language-change', language: lang });
    channel.close();
    // Sync with PageDock and other same-window listeners
    window.dispatchEvent(
      new CustomEvent('preview-language-change', { detail: { language: lang } })
    );
  }, [setCurrentLanguage, onLanguageChange]);

  const [overlayVisible, setOverlayVisible] = useClientStorage<boolean>(
    'overlay-visible',
    false,
    'local'
  );
  const [showInvisibleElements, setShowInvisibleElements] =
    useClientStorage<boolean>('show-invisible-elements', true, 'local');

  // Listen for visibility toggle changes from PageDock (same window) and external preview (cross-window)
  useEffect(() => {
    const onToggle = (e: Event) => {
      const show = (e as CustomEvent<{ showInvisible: boolean }>).detail?.showInvisible;
      if (show !== undefined) setShowInvisibleElements(show);
    };
    window.addEventListener('preview-visibility-toggle', onToggle as EventListener);

    const channel = new BroadcastChannel('preview-sync');
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'visibility-toggle' || event.data?.type === 'visibility-toggle-from-external') {
        const { showInvisible } = event.data;
        if (showInvisible !== undefined) setShowInvisibleElements(showInvisible);
      }
    };
    channel.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('preview-visibility-toggle', onToggle as EventListener);
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, [setShowInvisibleElements]);

  // Resolution preset state
  const [resolution, setResolution] = useState<ResolutionConfig>(() => getResolution('free', 'portrait'));
  const resContainerRef = useRef<HTMLDivElement>(null);

  // Calculate effective zoom (for 'fit' mode)
  const [fitZoom, setFitZoom] = useState(100);
  useEffect(() => {
    if (resolution.zoomMode !== 'fit' || resolution.preset === 'free') return;
    const measure = () => {
      const el = resContainerRef.current;
      if (!el) return;
      const containerWidth = el.clientWidth - 32;
      const containerHeight = window.innerHeight - 100;
      if (containerWidth > 0 && containerHeight > 0 && resolution.width > 0 && resolution.height > 0) {
        const scaleW = containerWidth / resolution.width;
        const scaleH = containerHeight / resolution.height;
        setFitZoom(Math.round(Math.min(scaleW, scaleH) * 100));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    if (resContainerRef.current) ro.observe(resContainerRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [resolution]);

  const effectiveZoom = resolution.zoomMode === 'fit' ? fitZoom : resolution.zoom;

  useEffect(() => {
    const onResChange = (e: Event) => {
      const config = (e as CustomEvent<ResolutionConfig>).detail;
      if (config) setResolution(config);
    };
    window.addEventListener('preview-resolution-change', onResChange as EventListener);

    const channel = new BroadcastChannel('preview-sync');
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resolution-change') {
        const { preset, orientation, width, height, label, zoom, zoomMode } = event.data;
        setResolution({ preset, orientation, width, height, label, zoom: zoom ?? 100, zoomMode: zoomMode ?? 'fixed' });
      }
    };
    channel.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('preview-resolution-change', onResChange as EventListener);
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, []);

  const [controlsExpanded, setControlsExpanded] = useClientStorage<boolean>(
    'preview-controls-expanded', 
    false, 
    'local'
  );

  // Lokaler State für Highlight via "Scroll to Viewport"
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Clear highlight when edit ID changes to avoid double selection
  useEffect(() => {
    if (editingElementId) {
        setHighlightedId(null);
    }
  }, [editingElementId]);

  const effectiveElements = useMemo(() => {
    const base = (ctxElements?.length ? ctxElements : pageElements) ?? [];
    
    // Check for create mode
    // const mode = searchParams.get('mode');
    // if (mode === 'create-element') { ... } // Removed as per user request
    
    return base;
  }, [ctxElements, pageElements, searchParams, page?._id]);

  // Handlers for move up/down
  const handleMoveUp = useCallback(async (id: string) => {
    const idx = effectiveElements.findIndex((x) => x._id === id);
    if (idx <= 0) return;
    
    // Swap with idx - 1
    const newOrder = [...effectiveElements];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx - 1];
    newOrder[idx - 1] = temp;
    
    // Convert to IDs
    const orderedIds = newOrder.map(x => x._id);
    
    reorderByIds(orderedIds);
    await persistOrder(newOrder); 
  }, [effectiveElements, reorderByIds, persistOrder]);

  const handleMoveDown = useCallback(async (id: string) => {
    const idx = effectiveElements.findIndex((x) => x._id === id);
    if (idx < 0 || idx >= effectiveElements.length - 1) return;
    
    const newOrder = [...effectiveElements];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx + 1];
    newOrder[idx + 1] = temp;
    
    const orderedIds = newOrder.map(x => x._id);

    reorderByIds(orderedIds);
    await persistOrder(newOrder);
  }, [effectiveElements, reorderByIds, persistOrder]);

  const handleCreateFirst = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('mode', 'create-element');
    sp.delete('editId');
    sp.delete('afterId');
    
    if (typeof onEnsureEditVisible === 'function') {
      onEnsureEditVisible();
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  // Create element after header or before footer
  const handleCreateAfterTemplate = (position: 'after-header' | 'before-footer') => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('mode', 'create-element');
    sp.delete('editId');
    if (position === 'after-header') {
      sp.delete('afterId'); // Insert at beginning
    } else {
      const lastEl = effectiveElements[effectiveElements.length - 1];
      if (lastEl) sp.set('afterId', lastEl._id);
      else sp.delete('afterId');
    }
    if (typeof onEnsureEditVisible === 'function') {
      onEnsureEditVisible();
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };
  
  const handleDuplicate = useCallback(async (element: PageElement) => {
    if (!page) return;
    const idx = effectiveElements.findIndex((e) => e._id === element._id);
    if (idx === -1) return;

    const current = effectiveElements[idx];
    const next = effectiveElements[idx + 1];

    const prevOrder = current.order;
    const nextOrderValue = next
      ? (prevOrder + next.order) / 2
      : prevOrder + 1;

    try {
      const res = await fetch(
        api.elementsBasePath,
        {
          method: 'POST',
          body: JSON.stringify({
            pageId: page._id,
            element: element.element,
            order: nextOrderValue,
            name: `DUPLIKAT von ${element.name}`,
            visible: false,
            data: element.data,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) return;
      const json = await res.json();
      if (json.element) {
        const newEl = json.element;
        const newList = [...effectiveElements];
        newList.splice(idx + 1, 0, newEl);
        setPageElements(newList);

        // Auto-switch to edit mode
        if (typeof onEnsureEditVisible === 'function') {
           onEnsureEditVisible();
        }
        const sp = new URLSearchParams(searchParams.toString());
        sp.set('mode', 'edit-element');
        sp.set('editId', newEl._id);
        sp.delete('afterId');
        
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

        // Scroll to new element
        requestAnimationFrame(() => {
          window.dispatchEvent(
            new CustomEvent('pe-scroll-to', { detail: { id: newEl._id } })
          );
        });
      }
    } catch (e) {
      console.error('Duplicate failed', e);
    }
  }, [page, effectiveElements, api, setPageElements]);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    document.body.style.cursor = 'grabbing';
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    document.body.style.cursor = '';
    
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = effectiveElements.findIndex((el) => String(el._id) === String(active.id));
      const newIndex = effectiveElements.findIndex((el) => String(el._id) === String(over.id));

      if (oldIndex >= 0 && newIndex >= 0) {
        const newItems = arrayMove(effectiveElements, oldIndex, newIndex);
        
        // Optimistic update
        setPageElements(newItems); // Sync context immediately
        
        await persistOrder(newItems); // Sync to Backend
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    document.body.style.cursor = '';
  };

  // ... useEffects for size and scroll ...
  // Wenn sich die verfügbaren Sprachen ändern und currentLanguage nicht mehr drin ist:
  useEffect(() => {
    if (!languages.includes(currentLanguage)) {
      setCurrentLanguage(languages[0] ?? DEFAULT_LANGUAGES[0]);
    }
  }, [languages.join(','), currentLanguage]);

  // Größe messen
  useEffect(() => {
    if (
      !containerRef.current ||
      typeof ResizeObserver === 'undefined'
    )
      return;
    const container = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const isInView = (container: HTMLElement, el: HTMLElement) => {
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.top >= c.top && r.bottom <= c.bottom;
  };
  
  // Auto-Scroll zum aktuell editierten Element
  useEffect(() => {
    if (!editingElementId || !containerRef.current) {
      if (!editingElementId) lastScrolledIdRef.current = null;
      return;
    }
    if (lastScrolledIdRef.current === editingElementId) return;

    const doScroll = () => {
      const sel = `.page-element[data-id="${escapeCss(
        String(editingElementId)
      )}"]`;
      const el = containerRef.current!.querySelector<HTMLDivElement>(sel);
      if (!el) return;

      const scroller =
        getScrollParent(containerRef.current!) || containerRef.current!;
      if (!isInView(scroller, el)) {
        scrollIntoViewWithin(scroller, el, 'smooth');
      }
      lastScrolledIdRef.current = String(editingElementId);
    };

    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(doScroll);
      return () => cancelAnimationFrame(r2);
    });

    return () => cancelAnimationFrame(r1);
  }, [editingElementId, effectiveElements.length]);

  // Direktes Scrollen via Event (pe-scroll-to)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onScrollTo = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      const target = node.querySelector<HTMLDivElement>(
        `.page-element[data-id="${escapeCss(String(id))}"]`
      );
      if (target) {
        const scroller = getScrollParent(node) || node;
        scrollIntoViewWithin(scroller, target, 'smooth');
        lastScrolledIdRef.current = String(id);
        
        // Markierung aktivieren
        setHighlightedId(String(id));
      }
    };

    window.addEventListener('pe-scroll-to', onScrollTo as EventListener);
    return () =>
      window.removeEventListener('pe-scroll-to', onScrollTo as EventListener);
  }, []);

  // Imperativer Hover-Bridge
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const clearHover = () => {
      if (hoveredElRef.current) {
        hoveredElRef.current.classList.remove('is-hovered');
        hoveredElRef.current = null;
      }
    };

    const onHover = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      const target = node.querySelector<HTMLDivElement>(
        `.page-element[data-id="${escapeCss(String(id))}"]`
      );
      if (!target || hoveredElRef.current === target) return;
      clearHover();
      target.classList.add('is-hovered');
      hoveredElRef.current = target;
    };

    const onHoverClear = () => clearHover();

    window.addEventListener('pe-hover', onHover as EventListener);
    window.addEventListener('pe-hover-clear', onHoverClear as EventListener);

    return () => {
      window.removeEventListener('pe-hover', onHover as EventListener);
      window.removeEventListener(
        'pe-hover-clear',
        onHoverClear as EventListener
      );
      clearHover();
    };
  }, []);

  // Wrapper-Renderer
  const renderItem = useCallback((node: ReactNode, el: PageElement, keyStr: string) => {
    // Placeholder removed
    
    const enhanced = React.isValidElement(node)
      ? React.cloneElement(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          node as React.ReactElement<any>,
          {
            __instanceKey: keyStr,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        )
      : node;
    
    const index = effectiveElements.findIndex(e => e._id === el._id);

    return (
      <PreviewElementWrapper
        key={el._id} // Important: Use stable ID for DnD
        element={el}
        highlightedId={highlightedId}
        onEnsureEditVisible={onEnsureEditVisible}
        index={index}
        totalCount={effectiveElements.length}
        moveUp={handleMoveUp}
        moveDown={handleMoveDown}
        controlsExpanded={controlsExpanded}
        setControlsExpanded={setControlsExpanded}
        onDuplicate={handleDuplicate}
      >
        {enhanced}
      </PreviewElementWrapper>
    );
  }, [effectiveElements, highlightedId, onEnsureEditVisible, handleMoveUp, handleMoveDown, controlsExpanded, setControlsExpanded, handleDuplicate]);
  
  // Element for Overlay
  const activeElement = useMemo(() => {
    if (!activeId) return null;
    return effectiveElements.find((e) => String(e._id) === String(activeId));
  }, [activeId, effectiveElements]);

  return (
    <DndContext 
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Container ref={containerRef}>
        {(resolution.preset === 'phone' || resolution.preset === 'tablet') && (
          <>
            <SimulateTouchStyles />
            <TouchScrollHandler />
          </>
        )}
        {/* Full-Overlay Loading Spinner while templates are loading */}
        {isPagePreview && templatesLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(243,244,246,1)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TbLoader2 size={32} style={{ animation: 'tpl-spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', color: '#6b7280' }} />
            <style jsx>{`
              @keyframes tpl-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
       {/* ... Settings Container ... */}
       <PreviewSettingsContainer>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            visibility: overlayVisible ? 'visible' : 'hidden',
            pointerEvents: overlayVisible ? 'auto' : 'none',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}>
              <VisibilityToggle
                type="button"
                onClick={() => {
                  const next = !showInvisibleElements;
                  setShowInvisibleElements(next);
                  window.dispatchEvent(
                    new CustomEvent('preview-visibility-toggle', { detail: { showInvisible: next } })
                  );
                  const channel = new BroadcastChannel('preview-sync');
                  channel.postMessage({ type: 'visibility-toggle', showInvisible: next });
                  channel.close();
                }}
                $active={showInvisibleElements}
                aria-label={showInvisibleElements ? 'Unsichtbare Elemente ausblenden' : 'Unsichtbare Elemente einblenden'}
                title={showInvisibleElements ? 'Unsichtbare Elemente ausblenden' : 'Unsichtbare Elemente einblenden'}
              >
                {showInvisibleElements ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
              </VisibilityToggle>
              <LanguageSwitcher
                languages={languages}
                activeLanguage={currentLanguage}
                onLanguageChange={handleSetLanguage}
              />
              <ResolutionSwitcher onResolutionChange={setResolution} />
          </div>
          <OverlayVisibilityButton
            onClick={() => setOverlayVisible((v) => !v)}
            aria-label="Layout-Overlay umschalten"
            title="Layout-Overlay umschalten"
          >
            <div>{overlayVisible ? <MdGridOff /> : <MdGridOn />}</div>
          </OverlayVisibilityButton>
        </PreviewSettingsContainer>

        {resolution.preset !== 'free' ? (
          <div ref={resContainerRef} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            minHeight: '100vh',
            background: '#e5e7eb',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}>
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '8px',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}>
              {resolution.label} · {effectiveZoom}%
            </div>
            <div style={{
              width: `${resolution.width * (effectiveZoom / 100)}px`,
              height: `${resolution.height * (effectiveZoom / 100)}px`,
              overflow: 'visible',
              position: 'relative',
              boxSizing: 'border-box',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div
                className={(resolution.preset === 'phone' || resolution.preset === 'tablet') ? 'simulate-touch' : undefined}
                data-device-viewport
                style={{
                width: `${resolution.width}px`,
                height: `${resolution.height}px`,
                background: '#fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                borderRadius: '4px',
                overflowX: 'hidden',
                overflowY: 'auto',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `scale(${effectiveZoom / 100})`,
                transformOrigin: 'top left',
                boxSizing: 'border-box',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                '--preview-scale': effectiveZoom / 100,
              } as React.CSSProperties}>

              {isPagePreview && !templatesLoading && headerElements.length > 0 && (
                <TemplateSectionWrapper>
                  <header>
                    <PageElementMapper elements={headerElements} currentLanguage={currentLanguage} />
                  </header>
                  {overlayVisible && (
                    <CollapsibleButtonGroup className="tpl-section-buttons" style={{ opacity: 1, pointerEvents: 'auto', transform: 'none' }}>
                      <ExpandedContent $expanded={headerExpanded}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <EditButton type="button" onClick={() => router.push(`/workspaces/${tplWorkspaceId}/templates/header` + (selectedHeaderId ? `?templateId=${selectedHeaderId}` : ''))} title="Header bearbeiten">
                            <MdEdit size={16} /><span>Bearbeiten</span>
                          </EditButton>
                          <CreateButton type="button" onClick={() => handleCreateAfterTemplate('after-header')} title="Element nach Header erstellen">
                            <MdAdd />
                          </CreateButton>
                          {headerTemplatesList.length > 1 && (
                            <TplSelect value={selectedHeaderId} onChange={(e) => {
                              const id = e.target.value;
                              setSelectedHeaderId(id);
                              fetchTemplateById(tplWorkspaceId, id).then(setHeaderElements);
                              window.dispatchEvent(new CustomEvent('preview-header-template-change', { detail: { templateId: id, workspaceId: tplWorkspaceId } }));
                            }}>
                              {headerTemplatesList.map(t => <option key={t._id} value={t._id}>{t.name}{t.isDefault ? ' ★' : ''}</option>)}
                            </TplSelect>
                          )}
                        </div>
                      </ExpandedContent>
                      <ToggleButton onClick={(e) => { e.stopPropagation(); setHeaderExpanded(!headerExpanded); }} $expanded={headerExpanded} title={headerExpanded ? 'Einklappen' : 'Menü ausklappen'}>
                        {headerExpanded ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                      </ToggleButton>
                    </CollapsibleButtonGroup>
                  )}
                </TemplateSectionWrapper>
              )}
              {(() => {
                const sortableContent = (
                  <SortableContext 
                    items={effectiveElements.map(e => String(e._id))}
                    strategy={verticalListSortingStrategy}
                  >
                    <PageElementMapper
                      currentLanguage={currentLanguage}
                      elements={effectiveElements}
                      sort
                      tieBreakById
                      renderItem={renderItem}
                      showInvisibleElements={showInvisibleElements}
                    />
                  </SortableContext>
                );
                return isPagePreview ? <main>{sortableContent}</main> : sortableContent;
              })()}
              {isPagePreview && !templatesLoading && footerElements.length > 0 && (
                <TemplateSectionWrapper>
                  <footer>
                    <PageElementMapper elements={footerElements} currentLanguage={currentLanguage} />
                  </footer>
                  {overlayVisible && (
                    <CollapsibleButtonGroup className="tpl-section-buttons" style={{ opacity: 1, pointerEvents: 'auto', transform: 'none' }}>
                      <ExpandedContent $expanded={footerExpanded}>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <EditButton type="button" onClick={() => router.push(`/workspaces/${tplWorkspaceId}/templates/footer` + (selectedFooterId ? `?templateId=${selectedFooterId}` : ''))} title="Footer bearbeiten">
                            <MdEdit size={16} /><span>Bearbeiten</span>
                          </EditButton>
                          <CreateButton type="button" onClick={() => handleCreateAfterTemplate('before-footer')} title="Element vor Footer erstellen">
                            <MdAdd />
                          </CreateButton>
                          {footerTemplatesList.length > 1 && (
                            <TplSelect value={selectedFooterId} onChange={(e) => {
                              const id = e.target.value;
                              setSelectedFooterId(id);
                              fetchTemplateById(tplWorkspaceId, id).then(setFooterElements);
                              window.dispatchEvent(new CustomEvent('preview-footer-template-change', { detail: { templateId: id, workspaceId: tplWorkspaceId } }));
                            }}>
                              {footerTemplatesList.map(t => <option key={t._id} value={t._id}>{t.name}{t.isDefault ? ' ★' : ''}</option>)}
                            </TplSelect>
                          )}
                        </div>
                      </ExpandedContent>
                      <ToggleButton onClick={(e) => { e.stopPropagation(); setFooterExpanded(!footerExpanded); }} $expanded={footerExpanded} title={footerExpanded ? 'Einklappen' : 'Menü ausklappen'}>
                        {footerExpanded ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                      </ToggleButton>
                    </CollapsibleButtonGroup>
                  )}
                </TemplateSectionWrapper>
              )}

              </div>
            </div>
          </div>
        ) : (
          <div style={{
            transform: effectiveZoom !== 100 ? `scale(${effectiveZoom / 100})` : undefined,
            transformOrigin: 'top left',
            width: effectiveZoom !== 100 ? `${100 / (effectiveZoom / 100)}%` : undefined,
            '--preview-scale': effectiveZoom / 100,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          } as React.CSSProperties}>

            {isPagePreview && !templatesLoading && headerElements.length > 0 && (
              <TemplateSectionWrapper>
                <header>
                  <PageElementMapper elements={headerElements} currentLanguage={currentLanguage} />
                </header>
                {overlayVisible && (
                  <CollapsibleButtonGroup className="tpl-section-buttons" style={{ opacity: 1, pointerEvents: 'auto', transform: 'none' }}>
                    <ExpandedContent $expanded={headerExpanded}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <EditButton type="button" onClick={() => router.push(`/workspaces/${tplWorkspaceId}/templates/header` + (selectedHeaderId ? `?templateId=${selectedHeaderId}` : ''))} title="Header bearbeiten">
                          <MdEdit size={16} /><span>Bearbeiten</span>
                        </EditButton>
                        <CreateButton type="button" onClick={() => handleCreateAfterTemplate('after-header')} title="Element nach Header erstellen">
                          <MdAdd />
                        </CreateButton>
                        {headerTemplatesList.length > 1 && (
                          <TplSelect value={selectedHeaderId} onChange={(e) => {
                            const id = e.target.value;
                            setSelectedHeaderId(id);
                            fetchTemplateById(tplWorkspaceId, id).then(setHeaderElements);
                            window.dispatchEvent(new CustomEvent('preview-header-template-change', { detail: { templateId: id, workspaceId: tplWorkspaceId } }));
                          }}>
                            {headerTemplatesList.map(t => <option key={t._id} value={t._id}>{t.name}{t.isDefault ? ' ★' : ''}</option>)}
                          </TplSelect>
                        )}
                      </div>
                    </ExpandedContent>
                    <ToggleButton onClick={(e) => { e.stopPropagation(); setHeaderExpanded(!headerExpanded); }} $expanded={headerExpanded} title={headerExpanded ? 'Einklappen' : 'Menü ausklappen'}>
                      {headerExpanded ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                    </ToggleButton>
                  </CollapsibleButtonGroup>
                )}
              </TemplateSectionWrapper>
            )}
            {(() => {
              const sortableContent = (
                <SortableContext 
                  items={effectiveElements.map(e => String(e._id))}
                  strategy={verticalListSortingStrategy}
                >
                  <PageElementMapper
                    currentLanguage={currentLanguage}
                    elements={effectiveElements}
                    sort
                    tieBreakById
                    renderItem={renderItem}
                    showInvisibleElements={showInvisibleElements}
                  />
                </SortableContext>
              );
              return isPagePreview ? <main>{sortableContent}</main> : sortableContent;
            })()}
            {isPagePreview && !templatesLoading && footerElements.length > 0 && (
              <TemplateSectionWrapper>
                <footer>
                  <PageElementMapper elements={footerElements} currentLanguage={currentLanguage} />
                </footer>
                {overlayVisible && (
                  <CollapsibleButtonGroup className="tpl-section-buttons" style={{ opacity: 1, pointerEvents: 'auto', transform: 'none' }}>
                    <ExpandedContent $expanded={footerExpanded}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <EditButton type="button" onClick={() => router.push(`/workspaces/${tplWorkspaceId}/templates/footer` + (selectedFooterId ? `?templateId=${selectedFooterId}` : ''))} title="Footer bearbeiten">
                          <MdEdit size={16} /><span>Bearbeiten</span>
                        </EditButton>
                        <CreateButton type="button" onClick={() => handleCreateAfterTemplate('before-footer')} title="Element vor Footer erstellen">
                          <MdAdd />
                        </CreateButton>
                        {footerTemplatesList.length > 1 && (
                          <TplSelect value={selectedFooterId} onChange={(e) => {
                            const id = e.target.value;
                            setSelectedFooterId(id);
                            fetchTemplateById(tplWorkspaceId, id).then(setFooterElements);
                            window.dispatchEvent(new CustomEvent('preview-footer-template-change', { detail: { templateId: id, workspaceId: tplWorkspaceId } }));
                          }}>
                            {footerTemplatesList.map(t => <option key={t._id} value={t._id}>{t.name}{t.isDefault ? ' ★' : ''}</option>)}
                          </TplSelect>
                        )}
                      </div>
                    </ExpandedContent>
                    <ToggleButton onClick={(e) => { e.stopPropagation(); setFooterExpanded(!footerExpanded); }} $expanded={footerExpanded} title={footerExpanded ? 'Einklappen' : 'Menü ausklappen'}>
                      {footerExpanded ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                    </ToggleButton>
                  </CollapsibleButtonGroup>
                )}
              </TemplateSectionWrapper>
            )}

          </div>
        )}
        
        {effectiveElements.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleCreateFirst} variant="contained">
              <MdAdd size={20} style={{ marginRight: 8 }} />
              Erstes {api.entityLabel}-Element erstellen
            </Button>
          </div>
        )}
        
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeElement ? (
             <div style={{ opacity: 0.9, transform: 'scale(1.02)' }}>
                {/* Render clean content or a snapshot. 
                    Since Mapper renders components, we re-use it for the single item 
                    BUT we need to make sure we don't render buttons or wrapper logic that breaks DnD overlay.
                    We invoke Mapper but pass only 1 element.
                */}
                <PageElementMapper 
                    elements={[activeElement]} 
                    currentLanguage={currentLanguage}
                    renderItem={(node) => (
                      <div key={'drag-overlay-item'} className="page-element" style={{ background: 'white', pointerEvents: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                        {node}
                      </div>
                    )}
                />
             </div>
          ) : null}
        </DragOverlay>
        
        {/* <PageDockButton containerRef={containerRef} /> */}
      </Container>
    </DndContext>
  );
};

const InsertionPlaceholder = styled.div`
  width: calc(100% - 4px);
  height: 100px;
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  border-image: repeating-linear-gradient(to right, red 0, red 8px, transparent 8px, transparent 16px) 8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  background: rgba(255, 0, 0, 0.02);
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  /* margin: 2rem 0; replaced by container padding/margin if needed, here mimicking previous layout */
  margin: 2rem auto;

  &::before {
    content: "ELEMENT ANFANG";
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    color: red;
    font-size: 10px;
    font-weight: 700;
  }

  &::after {
    content: "ELEMENT ENDE";
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    color: red;
    font-size: 10px;
    font-weight: 700;
  }
`;

export default PreviewContainer;

/* -------------------------------------------------------------------------------------------------
 * Styles
 * ------------------------------------------------------------------------------------------------- */

const Container = styled.div`
  box-sizing: border-box;
  background-color: #fff;
  position: relative;

  & .page-element {
    position: relative;
    container-type: inline-size;

    &.is-editing {
      div.helper-grid {
        border-top: 2px solid transparent;
        border-bottom: 2px solid transparent;
        border-image: repeating-linear-gradient(
            to right,
            var(--status-color, red) 0,
            var(--status-color, red) 8px,
            white 8px,
            white 16px
          )
          8;

        &::before {
          content: "ELEMENT ANFANG" attr(data-label);
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--status-color, red);
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        &::after {
          content: "ELEMENT ENDE" attr(data-label);
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--status-color, red);
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
      }
    }

    & > div.helper-grid {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transition: border-color 0.15s ease-in-out;
      pointer-events: none;
    }
  }
`;

const PreviewSettingsContainer = styled.div`
  position: sticky;
  top: 0;
  right: 1rem;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: -48px;
  gap: 0.5rem;
  width: fit-content;
  margin-left: auto;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const OverlayVisibilityButton = styled.button`
  z-index: 1;
  background: none;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  & > div {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid #ffffff;
    background-color: #ffee00;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }
`;

const Resolution = styled.div`
  background-color: #ffee00;
  color: #000;
  padding: 0.125rem 0.25rem;
  border-radius: 1rem;
  height: 28px;
  font-size: 0.875rem;
  border: 1px solid #ffffff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  user-select: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const VisibilityToggle = styled.button<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? '#22c55e' : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#dcfce7' : '#f3f4f6')};
  color: ${({ $active }) => ($active ? '#16a34a' : '#9ca3af')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: all 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? '#bbf7d0' : '#e5e7eb')};
  }
`;



const CollapsibleButtonGroup = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0;
  
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px) scale(calc(1 / var(--preview-scale, 1)));
  transform-origin: top right;
  transition: all 0.2s ease-in-out;

  /* Parent Hover Logic */
  .page-element:hover & {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(calc(1 / var(--preview-scale, 1)));
  }

  /* Mobile / Touch / Expanded: Always visible */
  @container (max-width: 480px) {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(calc(1 / var(--preview-scale, 1)));
  }
  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(calc(1 / var(--preview-scale, 1)));
  }
`;

const ToggleButton = styled.button<{ $expanded?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
  z-index: 2; /* On top of expanded content left edge */

  &:hover {
    background-color: #1d4ed8;
    transform: scale(1.05);
  }
`;

const ExpandedContent = styled.div<{ $expanded?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  
  /* Layout relative to toggle */
  padding-right: ${({ $expanded }) => ($expanded ? '8px' : '0px')};

  /* Animation */
  max-width: ${({ $expanded }) => ($expanded ? '600px' : '0px')};
  opacity: ${({ $expanded }) => ($expanded ? '1' : '0')};
  transition: max-width 0.3s ease-in-out, opacity 0.2s ease-in-out, padding-right 0.3s ease-in-out;
  overflow: hidden;
  pointer-events: ${({ $expanded }) => ($expanded ? 'auto' : 'none')};
  
  flex-direction: row-reverse;
  
  /* Reset button styles inside */
  button {
     white-space: nowrap;
  }

  @container (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: ${({ $expanded }) => ($expanded ? '100cqw' : '0px')};

    .toolbar-primary {
      order: 1;
      margin-left: auto;
    }
    .toolbar-secondary {
      order: 2;
      margin-left: auto;
    }
  }
`;


const ActionButtonBase = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  font-size: 0.875rem;
`;

const EditButton = styled(ActionButtonBase)`
  gap: 6px;
  background-color: #2563eb; 
  color: #ffffff;
  border-color: #1d4ed8;
  padding: 6px 12px;

  &:hover {
    background-color: #1d4ed8;
  }

  @container (max-width: 480px) {
    padding: 6px;
    span {
      display: none;
    }
  }
`;

const ElementActionContainer = styled.div`
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
`;

const ElementActionButton = styled.button`
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

const CreateButton = styled(ActionButtonBase)`
  background-color: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
  padding: 6px;
  width: 34px;
  height: 34px;
  position: relative;
  
  &:hover {
    background-color: #e5e7eb;
    color: #111827;
  }
`;

const DragHandleButton = styled(CreateButton)`
  cursor: grab;
  &:active {
    cursor: grabbing;
  }

  /* Hide on Mobile / Touch to avoid scroll conflicts and save space */
  @container (max-width: 480px) {
    display: none;
  }
  @media (hover: none) {
    display: none;
  }
`;

const TemplateSectionWrapper = styled.div`
  position: relative;

  .tpl-section-buttons {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }

  &:hover .tpl-section-buttons {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
`;

const TplSelect = styled.select`
  height: 34px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0 8px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  max-width: 160px;

  &:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }
`;

const TplSpinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: tpl-spin 0.7s linear infinite;

  @keyframes tpl-spin {
    to { transform: rotate(360deg); }
  }
`;

const SimulateTouchStyles = createGlobalStyle`
  .simulate-touch,
  .simulate-touch * {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(59,130,246,0.18)' stroke='rgba(59,130,246,0.5)' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3' fill='rgba(59,130,246,0.7)'/%3E%3C/svg%3E") 16 16, pointer !important;
  }

  /* Prevent text selection — touch devices scroll instead of selecting */
  .simulate-touch {
    user-select: none !important;
    -webkit-user-select: none !important;
  }

  /* Disable hover effects inside touch simulation */
  .simulate-touch .page-element:hover {
    outline: none !important;
  }

  /* Always show element buttons (like on a real touch device) */
  .simulate-touch .preview-edit-btn,
  .simulate-touch .tpl-section-buttons {
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateY(0) scale(calc(1 / var(--preview-scale, 1))) !important;
  }

  /* Settings buttons use normal pointer cursor (they're overlay controls, not part of the app) */
  .simulate-touch .preview-edit-btn,
  .simulate-touch .preview-edit-btn *,
  .simulate-touch .tpl-section-buttons,
  .simulate-touch .tpl-section-buttons * {
    cursor: pointer !important;
  }
`;

/**
 * Simulates touch-scroll: mouse drag scrolls the .simulate-touch container
 * instead of selecting text, mimicking real mobile swiping.
 */
function TouchScrollHandler() {
  useEffect(() => {
    const container = document.querySelector('.simulate-touch') as HTMLElement | null;
    if (!container) return;

    let isDragging = false;
    let startY = 0;
    let startX = 0;
    let scrollTop = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Don't intercept clicks on buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, a, select, input, textarea, [role="button"], .preview-edit-btn, .tpl-section-buttons')) return;

      isDragging = true;
      startY = e.clientY;
      startX = e.clientX;
      scrollTop = container.scrollTop;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = 'auto';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const dy = e.clientY - startY;
      const dx = e.clientX - startX;
      container.scrollTop = scrollTop - dy;
      container.scrollLeft = scrollLeft - dx;
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.scrollBehavior = '';
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return null;
}


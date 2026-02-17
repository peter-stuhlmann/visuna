'use client';

import { FC, useState, useEffect, RefObject, useMemo, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  MdArticle,
  MdDelete,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdAdd,
  MdQueryStats,
  MdTravelExplore,
} from 'react-icons/md';
import { getClientCookie } from '../content-elements/default/utils/cookies';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { LanguageCode } from '../language-settings/languages';
import { useClientStorage } from '../content-elements/default/utils/useLocalStorage';
import PageVisibilityStatus from '../page-visibility-status/PageVisibilityStatus';
import handlePagePublishStatus from '../pages/pages-list/utils/update-page-publish-status';
import BaseDockButton from './BaseDockButton';
import LanguageSwitcher from '../language-switcher/LanguageSwitcher';
import ResolutionSwitcher from '../resolution-switcher/ResolutionSwitcher';
import DeleteConfirmModal from '@/components/delete-confirm-modal/DeleteConfirmModal';

type PageType = 'PROFILE' | 'WORKSPACES' | 'PAGE_EDIT' | 'FORMS' | 'MEDIA' | 'OTHER';

const POPUP_WIDTH = 390;
const COOKIE_KEY = 'page-dock-position';
const COOKIE_EDGE_KEY = 'page-dock-edge';
const COLOR_COOKIE_KEY = 'page-dock-color';

const getContrastColor = (hexcolor: string) => {
  const hex = hexcolor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#18181b' : '#ffffff';
};

const getPageType = (pathname: string, searchParams: URLSearchParams | null): PageType => {
  if (pathname === '/profil') return 'PROFILE';
  if (pathname === '/workspaces' || pathname.match(/^\/workspaces$/)) return 'WORKSPACES';
  if (pathname.match(/\/workspaces\/[^\/]+\/seiten$/) && searchParams?.get('pageId')) return 'PAGE_EDIT';
  if (/\/workspaces\/[^\/]+\/seiten\/[^\/]+/.test(pathname)) return 'PAGE_EDIT';
  if (/\/workspaces\/[^\/]+\/formulare/.test(pathname)) return 'FORMS';
  if (/\/workspaces\/[^\/]+\/medienpool/.test(pathname)) return 'MEDIA';
  return 'OTHER';
};

const PageDockButton: FC<{ containerRef: RefObject<HTMLDivElement | null> }> = () => {
  const [availableLanguages, setAvailableLanguages] = useState<LanguageCode[]>([]);
  const [activePageData, setActivePageData] = useState<{
    _id: string;
    name: string;
    slug: string;
    publishStatus: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    headerTemplateId?: string;
    footerTemplateId?: string;
  } | null>(null);
  const [authorInfo, setAuthorInfo] = useState<Record<string, { name: string; email: string }>>({});
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [headerTemplates, setHeaderTemplates] = useState<{ _id: string; name: string; isDefault?: boolean }[]>([]);
  const [selectedHeaderTemplateId, setSelectedHeaderTemplateId] = useState<string>('');
  const [footerTemplates, setFooterTemplates] = useState<{ _id: string; name: string; isDefault?: boolean }[]>([]);
  const [selectedFooterTemplateId, setSelectedFooterTemplateId] = useState<string>('');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedWorkspace } = useSelectedWorkspace();
  const workspaceId = selectedWorkspace?._id || '';
  const pageType = getPageType(pathname, searchParams);

  const [currentLanguage, setCurrentLanguage] = useClientStorage<string>('preview-language', 'de', 'cookie');
  const [dimensions] = useClientStorage<{ width: number; height: number }>('preview-dimensions', { width: 0, height: 0 }, 'local');
  const [showInvisibleElements, setShowInvisibleElements] = useClientStorage<boolean>('show-invisible-elements', true, 'local');

  // External preview dimensions (null = no external preview open)
  const [externalDims, setExternalDims] = useState<{ width: number; height: number } | null>(null);

  // Delete modal state
  const [deletePageTarget, setDeletePageTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);

  const confirmDeletePage = useCallback(async () => {
    if (!deletePageTarget) return;
    setIsDeletingPage(true);
    setDeletePageTarget(null);
    try {
      await fetch(`/api/workspaces/${workspaceId}/pages/${deletePageTarget.id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('page-deleted', { detail: { pageId: deletePageTarget.id } }));
      router.push(`/workspaces/${workspaceId}/seiten`);
    } catch {
      // Fehler wird ignoriert — Seite existiert noch
    } finally {
      setIsDeletingPage(false);
    }
  }, [deletePageTarget, workspaceId, router]);

  // Listen for external preview dimension broadcasts
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'external-preview-dimensions') {
        setExternalDims({ width: event.data.width, height: event.data.height });
      }
      if (event.data?.type === 'external-preview-closed') {
        setExternalDims(null);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.close();
  }, []);

  // Handle language change: update local state + broadcast to external preview + sync with PreviewContainer
  const handleLanguageClick = (lang: string) => {
    setCurrentLanguage(lang);
    // Broadcast to external preview window
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'language-change', language: lang });
    channel.close();
    // Sync with PreviewContainer in same window
    window.dispatchEvent(
      new CustomEvent('preview-language-change', { detail: { language: lang } })
    );
  };

  // Listen for language changes from external preview
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'language-change-from-external') {
        const { language } = event.data;
        if (language) {
          setCurrentLanguage(language);
        }
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.close();
  }, [setCurrentLanguage]);

  // Also listen for language changes from PreviewContainer (same window)
  useEffect(() => {
    const onLangChange = (e: Event) => {
      const lang = (e as CustomEvent<{ language: string }>).detail?.language;
      if (lang) setCurrentLanguage(lang);
    };
    window.addEventListener('preview-language-change', onLangChange as EventListener);
    return () => window.removeEventListener('preview-language-change', onLangChange as EventListener);
  }, [setCurrentLanguage]);

  // Handle visibility toggle: update local state + broadcast to external preview + sync with PreviewContainer
  const handleVisibilityToggle = () => {
    const next = !showInvisibleElements;
    setShowInvisibleElements(next);
    // Dispatch AFTER the setter, not inside it, to avoid updating other components during render
    window.dispatchEvent(
      new CustomEvent('preview-visibility-toggle', { detail: { showInvisible: next } })
    );
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'visibility-toggle', showInvisible: next });
    channel.close();
  };

  // Listen for visibility toggle from PreviewContainer (same window)
  useEffect(() => {
    const onToggle = (e: Event) => {
      const show = (e as CustomEvent<{ showInvisible: boolean }>).detail?.showInvisible;
      if (show !== undefined) setShowInvisibleElements(show);
    };
    window.addEventListener('preview-visibility-toggle', onToggle as EventListener);
    return () => window.removeEventListener('preview-visibility-toggle', onToggle as EventListener);
  }, [setShowInvisibleElements]);

  // Listen for visibility toggle from external preview
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'visibility-toggle') {
        const { showInvisible } = event.data;
        if (showInvisible !== undefined) {
          setShowInvisibleElements(showInvisible);
          // Also sync with PreviewContainer in same window
          window.dispatchEvent(
            new CustomEvent('preview-visibility-toggle', { detail: { showInvisible } })
          );
        }
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.close();
  }, [setShowInvisibleElements]);

  useEffect(() => {
    if (workspaceId) {
      fetch(`/api/workspaces/${workspaceId}`).then(res => res.json()).then(data => {
        const langs: LanguageCode[] = data.workspace?.languages?.contentLanguages || data.languages?.contentLanguages;
        if (langs) {
          // Sort: main language (first) stays first, rest alphabetical
          const main = langs[0];
          const rest = langs.slice(1).sort((a, b) => a.localeCompare(b));
          setAvailableLanguages([main, ...rest]);
        }
      });
    }
  }, [workspaceId]);

  // Fetch header templates
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/workspaces/${workspaceId}/templates?type=header`)
      .then(res => res.json())
      .then(data => {
        const list = data.templates ?? [];
        setHeaderTemplates(list);
        // Auto-select the default one
        const def = list.find((t: any) => t.isDefault);
        if (def) setSelectedHeaderTemplateId(def._id);
        else if (list.length > 0) setSelectedHeaderTemplateId(list[0]._id);
      })
      .catch(() => {});
  }, [workspaceId]);

  // Fetch footer templates
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/workspaces/${workspaceId}/templates?type=footer`)
      .then(res => res.json())
      .then(data => {
        const list = data.templates ?? [];
        setFooterTemplates(list);
        // Auto-select the default one
        const def = list.find((t: any) => t.isDefault);
        if (def) setSelectedFooterTemplateId(def._id);
        else if (list.length > 0) setSelectedFooterTemplateId(list[0]._id);
      })
      .catch(() => {});
  }, [workspaceId]);

  // Wenn Seiten-Daten geladen: gespeicherte Template-IDs als Auswahl nutzen
  useEffect(() => {
    if (!activePageData) return;
    if (activePageData.headerTemplateId) {
      setSelectedHeaderTemplateId(activePageData.headerTemplateId);
      window.dispatchEvent(
        new CustomEvent('preview-header-template-change', { detail: { templateId: activePageData.headerTemplateId, workspaceId } })
      );
    }
    if (activePageData.footerTemplateId) {
      setSelectedFooterTemplateId(activePageData.footerTemplateId);
      window.dispatchEvent(
        new CustomEvent('preview-footer-template-change', { detail: { templateId: activePageData.footerTemplateId, workspaceId } })
      );
    }
  }, [activePageData, workspaceId]);

  useEffect(() => {
    if (pageType === 'PAGE_EDIT' && workspaceId) {
      const pageId = searchParams?.get('pageId') || pathname.match(/\/workspaces\/[^\/]+\/seiten\/([^\/]+)/)?.[1];
      if (pageId && pageId !== 'seiten') {
        fetch(`/api/workspaces/${workspaceId}/pages/${pageId}`).then(res => res.json()).then(data => {
          if (data.page) setActivePageData(data.page);
        });
      }
    } else {
      setActivePageData(null);
    }
  }, [pathname, pageType, workspaceId, searchParams]);

  // Resolve author user IDs to name/email
  useEffect(() => {
    if (!activePageData) { setAuthorInfo({}); return; }
    const ids = [activePageData.createdBy, activePageData.updatedBy].filter((id): id is string => !!id);
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) { setAuthorInfo({}); return; }

    fetch('/api/users/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: uniqueIds }),
    })
      .then(res => res.json())
      .then(data => { if (data.users) setAuthorInfo(data.users); })
      .catch(() => {});
  }, [activePageData?.createdBy, activePageData?.updatedBy]);

  // Sync publish status from other components (e.g. PagesList)
  useEffect(() => {
    const handleStatusSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      setActivePageData(prev => {
        if (!prev || prev._id !== detail.pageId) return prev;
        return { ...prev, publishStatus: detail.publishStatus };
      });
    };
    window.addEventListener('page-publish-status-change', handleStatusSync);
    return () => window.removeEventListener('page-publish-status-change', handleStatusSync);
  }, []);

  // Sync page deletion from other components (e.g. PagesList)
  useEffect(() => {
    const handlePageDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.pageId) return;
      setActivePageData((prev) => {
        if (!prev || prev._id !== detail.pageId) return prev;
        return null;
      });
    };
    window.addEventListener('page-deleted', handlePageDeleted);
    return () => window.removeEventListener('page-deleted', handlePageDeleted);
  }, []);

  const icon = useMemo(() => <MdArticle size={24} />, []);

  return (
    <>
    <BaseDockButton
      id="page-dock"
      icon={icon}
      storageKey={COOKIE_KEY}
      edgeKey={COOKIE_EDGE_KEY}
      colorKey={COLOR_COOKIE_KEY}
      pinnedKey="page-dock-pinned"
      defaultPosition={{ x: 20, y: typeof window !== 'undefined' ? window.innerHeight - 90 : 600 }}
    >
      <DockPopup>
        <PopupSection>
          <SectionTitle>
            {pageType === 'PAGE_EDIT' ? 'SEITENEINSTELLUNGEN' : 'AKTUELLE SEITE'}
          </SectionTitle>
          
          {activePageData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '14px' }}>{activePageData.name}</strong>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>/{activePageData.slug}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ActionContainer>
                  <ActionButton
                    type="button"
                    aria-label="Neue Seite erstellen"
                    title="Neue Seite erstellen"
                    onClick={() => {
                      router.push(`/workspaces/${workspaceId}/seiten`);
                    }}
                  >
                    <MdAdd size={18} color="#10b981" />
                  </ActionButton>
                  <ActionButton
                    type="button"
                    aria-label="Analyse"
                    title="Analyse"
                    onClick={() => {
                      router.push(`/workspaces/${workspaceId}/seiten/${activePageData._id}/analyse`);
                    }}
                  >
                    <MdQueryStats size={18} color="#8b5cf6" />
                  </ActionButton>
                  <ActionButton
                    type="button"
                    aria-label="SEO"
                    title="SEO-Einstellungen"
                    onClick={() => {
                      router.push(`/workspaces/${workspaceId}/seiten/${activePageData._id}/seo`);
                    }}
                  >
                    <MdTravelExplore size={18} color="#0ea5e9" />
                  </ActionButton>
                  <ActionButton
                    type="button"
                    aria-label="Seite duplizieren"
                    title="Seite duplizieren"
                    disabled={isDuplicating}
                    onClick={() => {
                      setIsDuplicating(true);
                      fetch(`/api/workspaces/${workspaceId}/pages/${activePageData._id}/duplicate`, { method: 'POST' })
                        .then(res => res.json())
                        .then(data => {
                          if (data.page?._id) {
                            router.push(`/workspaces/${workspaceId}/seiten/${data.page._id}`);
                          }
                        })
                        .finally(() => setIsDuplicating(false));
                    }}
                  >
                    <MdContentCopy size={18} color="#3b82f6" />
                  </ActionButton>
                  <ActionButton
                    type="button"
                    aria-label="Seite löschen"
                    title="Seite löschen"
                    onClick={() => setDeletePageTarget({ id: activePageData._id, name: activePageData.name })}
                  >
                    <MdDelete size={18} color="#ef4444" />
                  </ActionButton>
                </ActionContainer>
                <PageVisibilityStatus 
                  value={activePageData.publishStatus as any} 
                  onChange={(newStatus) => {
                    handlePagePublishStatus(activePageData._id, workspaceId, newStatus).then(() => {
                      setActivePageData(prev => prev ? { ...prev, publishStatus: newStatus } : null);
                    });
                  }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
                {activePageData.createdAt && (
                  <span>
                    Erstellt am {new Date(activePageData.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(activePageData.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    {activePageData.createdBy && authorInfo[activePageData.createdBy] && (
                      <> von <a href={`mailto:${authorInfo[activePageData.createdBy].email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{authorInfo[activePageData.createdBy].name}</a></>
                    )}
                  </span>
                )}
                {activePageData.updatedAt && (
                  <span>
                    Aktualisiert am {new Date(activePageData.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(activePageData.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    {activePageData.updatedBy && authorInfo[activePageData.updatedBy] && (
                      <> von <a href={`mailto:${authorInfo[activePageData.updatedBy].email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{authorInfo[activePageData.updatedBy].name}</a></>
                    )}
                  </span>
                )}
              </div>

              {/* Header-Template-Auswahl */}
              {headerTemplates.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Header:</span>
                  <TemplateSelect
                    value={selectedHeaderTemplateId}
                    onChange={(e) => {
                      const templateId = e.target.value;
                      setSelectedHeaderTemplateId(templateId);
                      window.dispatchEvent(
                        new CustomEvent('preview-header-template-change', { detail: { templateId, workspaceId } })
                      );
                      // In der DB speichern
                      if (activePageData?._id) {
                        fetch(`/api/workspaces/${workspaceId}/pages/${activePageData._id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ headerTemplateId: templateId }),
                        }).catch(() => {});
                      }
                    }}
                  >
                    {headerTemplates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}{t.isDefault ? ' ★' : ''}
                      </option>
                    ))}
                  </TemplateSelect>
                </div>
              )}

              {/* Footer-Template-Auswahl */}
              {footerTemplates.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Footer:</span>
                  <TemplateSelect
                    value={selectedFooterTemplateId}
                    onChange={(e) => {
                      const templateId = e.target.value;
                      setSelectedFooterTemplateId(templateId);
                      window.dispatchEvent(
                        new CustomEvent('preview-footer-template-change', { detail: { templateId, workspaceId } })
                      );
                      // In der DB speichern
                      if (activePageData?._id) {
                        fetch(`/api/workspaces/${workspaceId}/pages/${activePageData._id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ footerTemplateId: templateId }),
                        }).catch(() => {});
                      }
                    }}
                  >
                    {footerTemplates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}{t.isDefault ? ' ★' : ''}
                      </option>
                    ))}
                  </TemplateSelect>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>Sprache</span>
                  <LanguageSwitcher
                    languages={availableLanguages}
                    activeLanguage={currentLanguage}
                    onLanguageChange={handleLanguageClick}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>Unsichtbare</span>
                  <VisibilityToggle
                    type="button"
                    onClick={handleVisibilityToggle}
                    $active={showInvisibleElements}
                    aria-label={showInvisibleElements ? 'Unsichtbare Elemente ausblenden' : 'Unsichtbare Elemente einblenden'}
                  >
                    {showInvisibleElements ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
                  </VisibilityToggle>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>Vorschau</span>
                  <span style={{ fontSize: '12px' }}>{dimensions.width} × {dimensions.height}</span>
                </div>
                {externalDims && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>Externe Vorschau</span>
                    <span style={{ fontSize: '12px' }}>{externalDims.width} × {externalDims.height}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Auflösung</span>
                <ResolutionSwitcher />
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Keine Seite zum Bearbeiten ausgewählt</div>
          )}
        </PopupSection>
      </DockPopup>
    </BaseDockButton>

    <DeleteConfirmModal
      isOpen={!!deletePageTarget}
      title={`Seite "${deletePageTarget?.name}" löschen?`}
      message="Diese Seite und alle zugehörigen Seitenelemente werden unwiderruflich gelöscht."
      onConfirm={confirmDeletePage}
      onCancel={() => setDeletePageTarget(null)}
      isLoading={isDeletingPage}
    />
    </>
  );
};

export default PageDockButton;

const DockPopup = styled.div`
  position: relative;
  width: ${POPUP_WIDTH}px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 16px;
  z-index: 999;
`;

const PopupSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
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

const TemplateSelect = styled.select`
  flex: 1;
  height: 30px;
  padding: 0 28px 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background-color: white;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 14px;
  appearance: none;
  font-size: 12px;
  cursor: pointer;
  color: #374151;

  &:hover {
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

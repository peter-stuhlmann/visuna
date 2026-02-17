'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { 
  MdArticle, 
  MdWorkspaces, 
  MdImage, 
  MdDynamicForm, 
  MdSettings, 
  MdChevronRight,
  MdCollections,
  MdStar,
  MdStarBorder,
  MdExtension,
  MdTitle,
  MdList,
  MdVideocam,
  MdSmartButton,
  MdSpaceBar,
  MdPerson,
  MdLogout,
  MdAdd
} from 'react-icons/md';
import { useFavorites } from './useFavorites';

interface ExplorerItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: ExplorerItem[];
  type?: string; 
}

const ExplorerContainer = styled.div`
  display: flex;
  overflow: hidden;
  height: 300px;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Column = styled.div<{ $isVisible: boolean }>`
  flex: 1;
  min-width: 160px;
  max-width: 250px;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.4);
  display: ${({ $isVisible }) => $isVisible ? 'block' : 'none'};
  animation: fadeIn 0.2s ease-out;
  
  &:last-child {
    border-right: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
`;

const StarWrapper = styled.div<{ $isFavorite: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $isFavorite }) => $isFavorite ? 1 : 0};
  transition: opacity 0.2s;
  color: ${({ $isFavorite }) => $isFavorite ? '#f59e0b' : '#9ca3af'};
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #f59e0b;
  }
`;

const Item = styled.div<{ $active: boolean }>`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  color: ${({ $active }) => $active ? '#2563eb' : '#374151'};
  background: ${({ $active }) => $active ? 'rgba(37, 99, 235, 0.08)' : 'transparent'};
  border-left: 3px solid ${({ $active }) => $active ? '#2563eb' : 'transparent'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 2px 4px;
  border-radius: 6px;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
    color: #2563eb;
    
    ${StarWrapper} {
      opacity: 1;
    }
  }
`;

const ItemLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  opacity: 0.7;
`;

interface ExplorerProps {
  workspaceId: string;
  onLogout?: () => void;
  role?: string;
}

export type FavoriteItem = {
  id: string;
  label: string;
  href: string;
  type: string;
};

/* ---------- Module-level cache for Explorer data ---------- */
const EXPLORER_STALE_MS = 30_000;
let explorerCache: {
  workspaceId: string;
  pages: ExplorerItem[];
  forms: ExplorerItem[];
  timestamp: number;
} | null = null;

const Explorer: FC<ExplorerProps> = ({ workspaceId, onLogout, role }) => {
  const [pages, setPages] = useState<ExplorerItem[]>(
    explorerCache?.workspaceId === workspaceId ? explorerCache.pages : []
  );
  const [forms, setForms] = useState<ExplorerItem[]>(
    explorerCache?.workspaceId === workspaceId ? explorerCache.forms : []
  );
  const [hoverLvl1, setHoverLvl1] = useState<string | null>(null);
  const router = useRouter();
  
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    // If cache is fresh, skip re-fetching entirely
    if (
      explorerCache &&
      explorerCache.workspaceId === workspaceId &&
      Date.now() - explorerCache.timestamp < EXPLORER_STALE_MS
    ) {
      return;
    }

    const fetchPages = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/pages?limit=50`);
        const data = await res.json();
        const list = data.pages ?? data.results ?? [];
        if (list.length > 0) {
          const mapped = list.map((p: any) => ({
            id: `page-${p._id || p.id}`,
            label: p.name || p.label,
            href: `/workspaces/${workspaceId}/seiten?pageId=${p._id || p.id}`,
            type: 'PAGE'
          }));
          setPages(mapped);
          return mapped;
        }
      } catch (e) {
        console.error('Failed to fetch pages', e);
      }
      return null;
    };

    const fetchForms = async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/forms`);
        const data = await res.json();
        if (data.results) {
          const mapped = data.results.map((f: any) => ({
            id: `form-${f._id}`,
            label: f.name,
            href: `/workspaces/${workspaceId}/formularverwaltung/${f.slug}`,
            type: 'FORM'
          }));
          setForms(mapped);
          return mapped;
        }
      } catch (e) {
        console.error('Failed to fetch forms', e);
      }
      return null;
    };

    if (workspaceId) {
      Promise.all([fetchPages(), fetchForms()]).then(([p, f]) => {
        explorerCache = {
          workspaceId,
          pages: p ?? pages,
          forms: f ?? forms,
          timestamp: Date.now(),
        };
      });
    }
  }, [workspaceId]);

  // Listen for pages-changed events (from PagesList create/delete/duplicate)
  useEffect(() => {
    const handlePagesChanged = async () => {
      // Invalidate cache
      explorerCache = null;
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/pages?limit=50`);
        const data = await res.json();
        const list = data.pages ?? data.results ?? [];
        const mapped = list.map((p: any) => ({
          id: `page-${p._id || p.id}`,
          label: p.name || p.label,
          href: `/workspaces/${workspaceId}/seiten?pageId=${p._id || p.id}`,
          type: 'PAGE'
        }));
        setPages(mapped);
        // Update cache
        explorerCache = {
          workspaceId,
          pages: mapped,
          forms,
          timestamp: Date.now(),
        };
      } catch (e) {
        console.error('Failed to re-fetch pages after change', e);
      }
    };
    window.addEventListener('pages-changed', handlePagesChanged);
    return () => window.removeEventListener('pages-changed', handlePagesChanged);
  }, [workspaceId, forms]);

  const explorerData: ExplorerItem[] = [
    {
      id: 'seiten',
      label: 'Seiten',
      icon: <MdArticle size={18} />,
      href: `/workspaces/${workspaceId}/seiten`,
      type: 'PAGES_ROOT',
      children: [
        {
          id: 'new-page',
          label: 'Neue Seite anlegen',
          icon: <MdAdd size={18} />,
          href: `/workspaces/${workspaceId}/seiten?action=new`,
          type: 'NEW_PAGE'
        },
        ...pages
      ]
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: <MdWorkspaces size={18} />,
      href: '/workspaces',
      type: 'SETTINGS_ROOT',
      children: [
        { id: 'settings', label: 'Einstellungen', href: `/workspaces/${workspaceId}/einstellungen`, type: 'SETTINGS' },
        { id: 'languages', label: 'Sprachen', href: `/workspaces/${workspaceId}/sprachen`, type: 'LANGUAGES' },
        ...(role === 'admin' || role === 'superadmin' ? [
          { id: 'logs', label: 'Aktivitätenprotokoll', href: `/workspaces/${workspaceId}/logs`, type: 'LOGS' },
          { id: 'ai-logs', label: 'AI-Protokoll', href: `/workspaces/${workspaceId}/ai-logs`, type: 'LOGS' },
        ] : []),
        { id: 'users', label: 'Benutzerverwaltung', href: `/workspaces/${workspaceId}/benutzerverwaltung`, type: 'USERS' },
      ]
    },
    {
      id: 'media',
      label: 'Medienpool',
      icon: <MdImage size={18} />,
      href: `/workspaces/${workspaceId}/medienpool/bilder`,
      type: 'MEDIA_ROOT',
      children: [
        { id: 'images', label: 'Bilder', href: `/workspaces/${workspaceId}/medienpool/bilder`, type: 'IMAGES' },
        { id: 'docs', label: 'Dokumente', href: '#', type: 'DOCS' },
      ]
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <MdExtension size={18} />,
      href: `/workspaces/${workspaceId}/templates`,
      type: 'TEMPLATES_ROOT',
      children: [
        { id: 'tpl-header', label: 'Header', href: `/workspaces/${workspaceId}/templates/header`, type: 'TEMPLATE' },
        { id: 'tpl-footer', label: 'Footer', href: `/workspaces/${workspaceId}/templates/footer`, type: 'TEMPLATE' },
        { id: 'tpl-forms', label: 'Formulare', href: `/workspaces/${workspaceId}/templates/formulare`, type: 'FORMS_ROOT' },
        { id: 'tpl-galleries', label: 'Galerien', href: `/workspaces/${workspaceId}/templates/galerien`, type: 'GALLERY_ROOT' },
      ]
    },
    {
      id: 'konto',
      label: 'Konto',
      icon: <MdPerson size={18} />,
      href: '/profil',
      type: 'ACCOUNT_ROOT',
      children: [
        { id: 'profil', label: 'Profil', href: '/profil', type: 'USERS' },
        { id: 'logout', label: 'Abmelden', href: '#', type: 'LOGOUT' },
      ]
    },
    {
      id: 'defaults',
      label: 'Default-Einstellungen',
      icon: <MdSettings size={18} />,
      children: [
        { id: 'pe-text', label: 'Text', type: 'PE_TEXT', href: '#' },
        { id: 'pe-heading', label: 'Überschrift', type: 'PE_HEADING', href: '#' },
        { id: 'pe-list', label: 'Liste', type: 'PE_LIST', href: '#' },
        { id: 'pe-image', label: 'Bild', type: 'PE_IMAGE', href: '#' },
        { id: 'pe-video', label: 'Video', type: 'PE_VIDEO', href: '#' },
        { id: 'pe-button', label: 'Button', type: 'PE_BUTTON', href: '#' },
        { id: 'pe-spacer', label: 'Abstandshalter', type: 'PE_SPACER', href: '#' },
      ]
    }
  ];

  const lvl1Item = explorerData.find(i => i.id === hoverLvl1);
  const lvl2Items = lvl1Item?.children || [];

  const handleItemClick = (item: ExplorerItem) => {
    if (item.id === 'logout' && onLogout) {
      onLogout();
      return;
    }
    if (item.href && item.href !== '#') {
      router.push(item.href);
    }
  };



  return (
    <ExplorerContainer>
      {/* Column 1 */}
      <Column $isVisible={true}>
        {explorerData.map((item) => {
          const isFavorite = favorites.some(f => f.id === item.id);
          
          return (
            <Item 
              key={item.id} 
              $active={hoverLvl1 === item.id}
              onMouseEnter={() => setHoverLvl1(item.id)}
              onClick={() => handleItemClick(item)}
            >
              <ItemLabel>
                <IconWrapper>{item.icon}</IconWrapper>
                {item.label}
              </ItemLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <StarWrapper 
                  $isFavorite={isFavorite} 
                  onClick={(e) => toggleFavorite(e, item)}
                  title={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                >
                  {isFavorite ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                </StarWrapper>
                {item.children && <MdChevronRight size={14} style={{ opacity: 0.5 }} />}
              </div>
            </Item>
          );
        })}
      </Column>

      {/* Column 2 */}
      <Column $isVisible={lvl2Items.length > 0}>
        {lvl2Items.map((item) => {
          const isFavorite = favorites.some(f => f.id === item.id);

          return (
            <Item 
              key={item.id} 
              $active={false}
              onClick={() => handleItemClick(item)}
            >
              <ItemLabel>
                {item.icon && <IconWrapper>{item.icon}</IconWrapper>}
                {item.label}
              </ItemLabel>
              <StarWrapper 
                $isFavorite={isFavorite} 
                onClick={(e) => toggleFavorite(e, item)}
                title={isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              >
                {isFavorite ? <MdStar size={18} /> : <MdStarBorder size={18} />}
              </StarWrapper>
            </Item>
          );
        })}
      </Column>
    </ExplorerContainer>
  );
};

export default Explorer;

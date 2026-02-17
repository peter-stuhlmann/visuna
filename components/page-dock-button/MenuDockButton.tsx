'use client';

import { FC, useState, useRef, useEffect, RefObject, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  MdArticle,
  MdImage,
  MdPerson,
  MdLogout,
  MdDynamicForm,
  MdExpandLess,
  MdExpandMore,
  MdPublic,
  MdFolderOpen,
  MdSettings,
  MdHistory,
  MdInsertDriveFile,
  MdCollections,
  MdTitle,
  MdList,
  MdVideocam,
  MdSmartButton,
  MdSpaceBar
} from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDockBar } from './DockBarContext';
import Explorer, { FavoriteItem } from './Explorer';
import { useFavorites } from './useFavorites';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { useClientStorage } from '../content-elements/default/utils/useLocalStorage';
import { signOut } from 'next-auth/react';
import BaseDockButton from './BaseDockButton';

const POPUP_WIDTH = 390;
const COOKIE_KEY = 'menu-dock-position';
const COOKIE_EDGE_KEY = 'menu-dock-edge';
const COLOR_COOKIE_KEY = 'menu-dock-color';



const getFavoriteIcon = (type: string, size: number = 26) => {
  switch (type) {
    case 'PAGE': return <MdArticle size={size} />;
    case 'FORM': return <MdDynamicForm size={size} />;
    case 'SETTINGS': return <MdSettings size={size} />;
    case 'LANGUAGES': return <MdPublic size={size} />;
    case 'LOGS': return <MdHistory size={size} />;
    case 'USERS': return <MdPerson size={size} />;
    case 'IMAGES': return <MdImage size={size} />;
    case 'DOCS': return <MdInsertDriveFile size={size} />;
    case 'GALLERY': return <MdCollections size={size} />;
    case 'PE_TEXT': return <MdArticle size={size} />;
    case 'PE_HEADING': return <MdTitle size={size} />;
    case 'PE_LIST': return <MdList size={size} />;
    case 'PE_IMAGE': return <MdImage size={size} />;
    case 'PE_VIDEO': return <MdVideocam size={size} />;
    case 'PE_BUTTON': return <MdSmartButton size={size} />;
    case 'PE_SPACER': return <MdSpaceBar size={size} />;
    case 'LOGOUT': return <MdLogout size={size} />;
    default: return <FaStar size={size} />;
  }
};

const MenuDockButton: FC<{ containerRef: RefObject<HTMLDivElement | null> }> = () => {
  const [showExplorer, setShowExplorer] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const { selectedWorkspace, userRole } = useSelectedWorkspace();
  const workspaceId = selectedWorkspace?._id || '';

  const isDraggingMenuRef = useRef(false);

  const [menuOrder, setMenuOrder] = useClientStorage<string[]>(
    'page-dock-menu-order',
    ['explorer'],
    'cookie'
  );
  const { favorites } = useFavorites();

  useEffect(() => {
    const favoriteIds = favorites.map(f => f.id);
    const essentialIds = ['explorer'];
    const currentOrder = menuOrder.filter(id => favoriteIds.includes(id) || essentialIds.includes(id));
    const newItems = favoriteIds.filter(id => !currentOrder.includes(id));
    const missingEssentials = essentialIds.filter(id => !currentOrder.includes(id));
    
    if (newItems.length > 0 || missingEssentials.length > 0 || currentOrder.length !== menuOrder.length) {
      setMenuOrder([...currentOrder, ...newItems, ...missingEssentials]);
    }
  }, [favorites, setMenuOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleMenuDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenuOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setTimeout(() => { isDraggingMenuRef.current = false; }, 50);
  };

  useEffect(() => {
    // Colors are now handled by BaseDockButton
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const { isButtonDocked } = useDockBar();
  const isDocked = isButtonDocked('menu-dock');

  const icon = useMemo(() => <MdFolderOpen size={24} />, []);

  return (
    <BaseDockButton
      id="menu-dock"
      icon={icon}
      storageKey={COOKIE_KEY}
      edgeKey={COOKIE_EDGE_KEY}
      colorKey={COLOR_COOKIE_KEY}
      pinnedKey="menu-dock-pinned"
      defaultPosition={{ x: 20, y: 150 }}
      dockSlotIndex={6}
    >
      <DockPopup>
        <PopupSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <SectionTitle style={{ marginBottom: 0 }}>EXPLORER</SectionTitle>
            <TitleAction onClick={() => setShowExplorer(!showExplorer)}>
              {showExplorer ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
            </TitleAction>
          </div>
          {showExplorer && <Explorer workspaceId={workspaceId} onLogout={handleLogout} role={userRole} />}
        </PopupSection>

        {!isDocked && (
          <PopupSection>
            <SectionTitle>FAVORITEN</SectionTitle>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMenuDragEnd}>
              <SortableContext items={menuOrder} strategy={rectSortingStrategy}>
                <IconButtonGrid>
                  {menuOrder.map((id) => {
                    if (id === 'explorer') return null;
                    const fav = favorites.find(f => f.id === id);
                    if (!fav) return null;
                    return (
                      <SortableMenuButton
                        key={id}
                        id={id}
                        item={{ id: fav.id, label: fav.label, href: fav.href, icon: getFavoriteIcon(fav.type), title: fav.label }}
                        isCurrentPage={pathname === fav.href}
                        workspaceId={workspaceId}
                        router={router}
                        isDraggingMenuRef={isDraggingMenuRef}
                      />
                    );
                  })}
                </IconButtonGrid>
              </SortableContext>
            </DndContext>
          </PopupSection>
        )}
      </DockPopup>
    </BaseDockButton>
  );
};

export default MenuDockButton;

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
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PopupSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
`;

const TitleAction = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
`;

const IconButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 70px);
  gap: 10px;
`;

const SortableMenuButton = ({ id, item, isCurrentPage, router, isDraggingMenuRef, onExplorerToggle }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 2 : 1, opacity: isDragging ? 0.5 : 1 };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingMenuRef.current) return;
    if (onExplorerToggle) { onExplorerToggle(); return; }
    if (item.href && item.href !== '#') router.push(item.href);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IconButton 
        onClick={handleClick} 
        $active={isCurrentPage} 
        title={item.title}
        data-is-current-page={isCurrentPage}
      >
        <div className="icon-wrapper">{item.icon}</div>
        <span className="label">{item.label}</span>
      </IconButton>
    </div>
  );
};

const IconButton = styled.button<{ $active?: boolean }>`
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.1)' : 'white'};
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  .icon-wrapper { color: ${({ $active }) => $active ? '#3b82f6' : '#4b5563'}; margin-bottom: 4px; }
  .label { font-size: 10px; color: #6b7280; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; padding: 0 4px; }
  &:hover { background: #f9fafb; border-color: #d1d5db; transform: translateY(-2px); }
`;



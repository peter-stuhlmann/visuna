'use client';

import { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDockBar } from './DockBarContext';
import { useFavorites } from './useFavorites';
import { FavoriteItem } from './Explorer';
import { MdArticle, MdWorkspaces, MdImage, MdDynamicForm, MdCollections, MdPerson, MdSettings, MdStar, MdVerticalAlignBottom } from 'react-icons/md';

const SLOT_SIZE = 55;
const BAR_HEIGHT = 100;
const PEEK_HEIGHT = 80;

const BarContainer = styled.div<{ $isHovered: boolean; $slotCount: number; $isDragTarget: boolean; $isAnyOpen: boolean; $isEmpty: boolean; $isDragging: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(${({ $isHovered, $isDragTarget, $isAnyOpen, $isEmpty, $isDragging }) => {
    if ($isHovered || $isDragTarget || $isAnyOpen) return '0';
    if ($isDragging) return `${PEEK_HEIGHT}px`;
    if ($isEmpty) return `${BAR_HEIGHT}px`;
    return `${PEEK_HEIGHT}px`;
  }});
  height: ${BAR_HEIGHT}px;
  min-width: 120px;
  width: ${({ $slotCount }) => $slotCount > 0 ? `${Math.max($slotCount * (SLOT_SIZE + 8) + 24, 120)}px` : '180px'};
  background: ${({ $isDragTarget }) => $isDragTarget ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.45)'};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: ${({ $isDragTarget }) => $isDragTarget ? '3px dashed #3b82f6' : '1px solid rgba(255, 255, 255, 0.5)'};
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  box-shadow: ${({ $isDragTarget }) => $isDragTarget
    ? '0 -4px 24px rgba(59, 130, 246, 0.3)'
    : '0 -8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  z-index: 999;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease, border 0.2s ease, background 0.2s ease;

  @media (max-width: 660px) {
    height: 70px;
    transform: translateX(-50%) translateY(${({ $isEmpty, $isHovered, $isDragTarget, $isAnyOpen, $isDragging }) => {
      if ($isHovered || $isDragTarget || $isAnyOpen) return '0';
      if ($isDragging) return '0';
      if ($isEmpty) return '70px';
      return '0';
    }});
    width: ${({ $slotCount }) => $slotCount > 0 ? `${Math.max($slotCount * (30 + 8) + 24, 120)}px` : '140px'};
    border-radius: 12px 12px 0 0;
  }
`;

const Slot = styled.div<{ $isEmpty: boolean; $isDockSlot: boolean }>`
  width: ${SLOT_SIZE}px;
  height: ${SLOT_SIZE}px;
  border-radius: 12px;
  border: 2px dashed ${({ $isEmpty, $isDockSlot }) => 
    $isEmpty 
      ? ($isDockSlot ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.15)') 
      : 'transparent'
  };
  background: ${({ $isEmpty }) => $isEmpty ? 'rgba(0, 0, 0, 0.03)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $isEmpty }) => $isEmpty ? 'rgba(59, 130, 246, 0.5)' : 'transparent'};
    background: ${({ $isEmpty }) => $isEmpty ? 'rgba(59, 130, 246, 0.05)' : 'transparent'};
  }

  @media (max-width: 660px) {
    width: 30px;
    height: 30px;
    border-radius: 6px;
  }
`;

const FavoriteButton = styled.button`
  width: ${SLOT_SIZE - 8}px;
  height: ${SLOT_SIZE - 8}px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  @media (max-width: 660px) {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    box-sizing: border-box;
    svg { font-size: 16px !important; }
  }
`;

const DockedButton = styled.button<{ $backgroundColor: string; $textColor: string }>`
  width: ${SLOT_SIZE - 8}px;
  height: ${SLOT_SIZE - 8}px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $textColor }) => $textColor};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 660px) {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    box-sizing: border-box;
    svg { font-size: 16px !important; }
  }
`;

const getFavoriteIcon = (type: string, size: number = 22) => {
  switch (type) {
    case 'PAGE': case 'PAGES_ROOT': return <MdArticle size={size} />;
    case 'SETTINGS': case 'SETTINGS_ROOT': return <MdSettings size={size} />;
    case 'IMAGES': case 'MEDIA_ROOT': return <MdImage size={size} />;
    case 'FORM': case 'FORMS_ROOT': return <MdDynamicForm size={size} />;
    case 'GALLERY': case 'GALLERY_ROOT': return <MdCollections size={size} />;
    case 'USERS': case 'ACCOUNT_ROOT': return <MdPerson size={size} />;
    case 'LANGUAGES': return <MdWorkspaces size={size} />;
    default: return <MdStar size={size} />;
  }
};

import { usePathname } from 'next/navigation';

const BottomDockBar: FC = () => {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const { dockedButtons, setDropZoneRef, isBarHovered, setIsBarHovered, isDraggingOverBar, getDockButtonProps, draggingButtonId, dockButtonsProps } = useDockBar();
  
  const { favorites } = useFavorites();
  
  useEffect(() => {
    if (barRef.current) {
      setDropZoneRef(barRef as React.RefObject<HTMLDivElement>);
    }
  }, [setDropZoneRef]);

  const displayedFavorites = favorites.slice(0, 5);
  const pageDockDocked = dockedButtons.some(b => b.id === 'page-dock');
  const menuDockDocked = dockedButtons.some(b => b.id === 'menu-dock');
  const aiChatDocked = dockedButtons.some(b => b.id === 'ai-chat');
  const hasUndockedButtons = !pageDockDocked || !menuDockDocked || !aiChatDocked;
  
  // Calculate total slots to show
  const favoriteSlots = displayedFavorites.length;
  const dockSlots = (pageDockDocked ? 1 : 0) + (menuDockDocked ? 1 : 0) + (aiChatDocked ? 1 : 0);
  const totalSlots = favoriteSlots + dockSlots;
  const isEmpty = totalSlots === 0;

  const handleRedockAll = () => {
    window.dispatchEvent(new CustomEvent('dock-all-buttons'));
  };
  
  // Check if any docked button is open
  const isAnyDockedButtonOpen = Array.from(dockButtonsProps.values())
    .some(props => dockedButtons.some(b => b.id === props.id) && props.isOpen);

  const handleFavoriteClick = (href: string) => {
    if (href && href !== '#') {
      window.location.href = href;
    }
  };

  // Hide dock in external preview
  if (pathname?.endsWith('/preview')) return null;

  return (
    <BarContainer
      ref={barRef}
      data-dock-bar
      $isHovered={isBarHovered}
      $slotCount={totalSlots}
      $isDragTarget={isDraggingOverBar}
      $isAnyOpen={isAnyDockedButtonOpen}
      $isEmpty={isEmpty}
      $isDragging={draggingButtonId !== null}
      onMouseEnter={() => setIsBarHovered(true)}
      onMouseLeave={() => setIsBarHovered(false)}
    >
      {/* Re-dock button */}
      {hasUndockedButtons && (
        <RedockButton onClick={handleRedockAll} title="Alle Buttons andocken">
          <MdVerticalAlignBottom size={14} />
        </RedockButton>
      )}
      {/* Favorite Slots */}
      {displayedFavorites.map((fav) => (
        <Slot key={fav.id} $isEmpty={false} $isDockSlot={false}>
          <FavoriteButton 
            onClick={() => handleFavoriteClick(fav.href)}
            title={fav.label}
          >
            {getFavoriteIcon(fav.type)}
          </FavoriteButton>
        </Slot>
      ))}
      
      {/* Dock Button Slots - only show if docked */}
      {pageDockDocked && (() => {
        const props = getDockButtonProps('page-dock');
        return props ? (
          <Slot $isEmpty={false} $isDockSlot={true}>
            <DockedButton
              $backgroundColor={props.color}
              $textColor={props.textColor}
              onMouseDown={props.onDragStart}
              onClick={props.onClick}
              title="Page Dock (ziehen zum Lösen)"
              style={{ visibility: draggingButtonId === 'page-dock' ? 'hidden' : 'visible' }}
            >
              {props.icon}
            </DockedButton>
          </Slot>
        ) : <Slot $isEmpty={true} $isDockSlot={true} />;
      })()}
      {menuDockDocked && (() => {
        const props = getDockButtonProps('menu-dock');
        return props ? (
          <Slot $isEmpty={false} $isDockSlot={true}>
            <DockedButton
              $backgroundColor={props.color}
              $textColor={props.textColor}
              onMouseDown={props.onDragStart}
              onClick={props.onClick}
              title="Menu Dock (ziehen zum Lösen)"
              style={{ visibility: draggingButtonId === 'menu-dock' ? 'hidden' : 'visible' }}
            >
              {props.icon}
            </DockedButton>
          </Slot>
        ) : <Slot $isEmpty={true} $isDockSlot={true} />;
      })()}
      {aiChatDocked && (() => {
        const props = getDockButtonProps('ai-chat');
        return props ? (
          <Slot $isEmpty={false} $isDockSlot={true}>
            <DockedButton
              $backgroundColor={props.color}
              $textColor={props.textColor}
              onMouseDown={props.onDragStart}
              onClick={props.onClick}
              title="AI Chat (ziehen zum Lösen)"
              style={{ visibility: draggingButtonId === 'ai-chat' ? 'hidden' : 'visible' }}
            >
              {props.icon}
            </DockedButton>
          </Slot>
        ) : <Slot $isEmpty={true} $isDockSlot={true} />;
      })()}
    </BarContainer>
  );
};

export default BottomDockBar;

const RedockButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background: white;
    color: #2563eb;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

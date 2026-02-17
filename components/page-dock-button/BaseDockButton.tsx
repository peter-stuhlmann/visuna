'use client';

import { FC, useState, useRef, useEffect, useCallback, ReactNode, RefObject, useMemo } from 'react';
import styled from 'styled-components';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { MdPalette } from 'react-icons/md';
import { useClientStorage } from '../content-elements/default/utils/useLocalStorage';
import { useDockBar } from './DockBarContext';

const BAR_HEIGHT = 100;

export type Position = { x: number; y: number };
export type EdgeState = 'left' | 'right' | 'free';

interface BaseDockButtonProps {
  id: string;
  icon: ReactNode;
  children: ReactNode;
  storageKey: string;
  edgeKey: string;
  defaultPosition?: Position;
  colorKey: string;
  pinnedKey: string;
  textColor?: string;
  onDragStart?: () => void;
  onDragEnd?: (pos: Position) => void;
  popupWidth?: number;
  hidePinButton?: boolean;
  dockSlotIndex?: number;
}

const BaseDockButton: FC<BaseDockButtonProps> = ({
  id,
  icon,
  children,
  storageKey,
  edgeKey,
  defaultPosition = { x: 20, y: 150 },
  colorKey,
  pinnedKey,
  onDragStart,
  onDragEnd,
  popupWidth = 390,
  hidePinButton = false,
  dockSlotIndex = 5
}) => {
  const [edgeState, setEdgeState] = useClientStorage<EdgeState>(edgeKey, 'free', 'cookie');
  const [color, setColor] = useClientStorage<string>(colorKey, '#3b82f6', 'cookie');
  const [isPinned, setIsPinned] = useClientStorage<boolean>(pinnedKey, false, 'cookie');
  const effectivePinned = hidePinButton ? false : isPinned;

  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [buttonSize, setButtonSize] = useState(70);
  const [mounted, setMounted] = useState(false);
  const [popupDirection, setPopupDirection] = useState<{ h: 'left' | 'right'; v: 'top' | 'bottom' }>({ h: 'right', v: 'top' });
  const [measuredPopupWidth, setMeasuredPopupWidth] = useState(popupWidth);
  
  // Dock bar integration
  const { 
    isInDropZone, dockButton, undockButton, isButtonDocked, 
    isBarHovered, setIsDraggingOverBar, registerDockButton, 
    unregisterDockButton, setDraggingButtonId, allDocks, updateDockMetadata,
    activeDockedPopup, setActiveDockedPopup
  } = useDockBar();
  
  const [persistedPosition, setPersistedPosition] = useClientStorage<Position>(
    storageKey || `${id}-position`,
    defaultPosition || { x: 20, y: 20 },
    'cookie'
  );

  const [position, setPosition] = useState<Position>(persistedPosition);
  const [isDocked, setIsDocked] = useClientStorage<boolean>(`${id}-docked`, true, 'cookie');

  const containerRef = useRef<HTMLDivElement>(null);
  const forbiddenRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const wasDraggedRef = useRef(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosRef = useRef<Position | null>(null);
  const isOpenRef = useRef(isOpen);
  const resistanceThreshold = 50; // px to drag before undocking
  const allDocksRef = useRef(allDocks);

  // Keep Ref in sync with context without triggering re-renders of stable handlers
  useEffect(() => {
    allDocksRef.current = allDocks;
  }, [allDocks]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 'glass', 
    '#ec4899', '#06b6d4', '#84cc16', '#22c55e', '#64748b',
    '#000000', '#ffffff'
  ];

  const getContrastColor = (hex: string) => {
    if (hex === 'glass') return '#18181b';
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#18181b' : '#ffffff';
  };

  const textColor = getContrastColor(color);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !effectivePinned && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // If docked, ignore clicks on the dock bar — let handleDockedClick handle the toggle
        if (isDocked) {
          const dockBar = document.querySelector('[data-dock-bar]');
          if (dockBar && dockBar.contains(e.target as Node)) return;
        }
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, effectivePinned]);

  // Calculate popup direction and measure actual width when opened or position changes
  useEffect(() => {
    if (!isOpen || !popupRef.current) return;
    
    const popupRect = popupRef.current.getBoundingClientRect();
    const popupHeight = popupRect.height || 400; // fallback
    const actualWidth = popupRect.width || popupWidth;
    const buffer = 32; // 2rem buffer
    
    setMeasuredPopupWidth(actualWidth);
    
    const spaceRight = window.innerWidth - position.x - buttonSize;
    const spaceTop = position.y;
    
    const h: 'left' | 'right' = spaceRight >= popupWidth + buffer ? 'right' : 'left';
    const v: 'top' | 'bottom' = spaceTop >= popupHeight + buffer ? 'top' : 'bottom';
    
    setPopupDirection({ h, v });
  }, [isOpen, position, buttonSize, popupWidth]);

  const getButtonSize = (width: number): number => {
    if (width < 660) return 30;
    if (width <= 1280) return 55;
    return 70;
  };

  useEffect(() => {
    const updateSizeAndPosition = () => {
      const size = getButtonSize(window.innerWidth);
      setButtonSize(size);
      
      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size;
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };
    
    updateSizeAndPosition();
    setMounted(true);
    
    window.addEventListener('resize', updateSizeAndPosition);
    return () => window.removeEventListener('resize', updateSizeAndPosition);
  }, []);

  const constrainToViewport = useCallback((x: number, y: number, currentButtonSize: number): Position => {
    const maxX = window.innerWidth - currentButtonSize;
    const maxY = window.innerHeight - currentButtonSize;
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y))
    };
  }, []);

  // Sync persisted position to local state (skip during drag to avoid loops)
  useEffect(() => {
    if (isDragging) return;
    setPosition(prev => {
      if (prev.x === persistedPosition.x && prev.y === persistedPosition.y) return prev;
      return persistedPosition;
    });
  }, [persistedPosition, isDragging]);

  // Update global dock positions for collision detection (skip during drag to avoid render cascade)
  useEffect(() => {
    if (!mounted || isDragging) return;
    updateDockMetadata(id, { x: position.x, y: position.y, size: buttonSize });
    return () => {
      updateDockMetadata(id, null);
    };
  }, [id, position.x, position.y, buttonSize, updateDockMetadata, mounted, isDragging]);

  // Sync docked state with context on mount
  useEffect(() => {
    if (isDocked) {
      dockButton(id, dockSlotIndex);
    }
    return () => {
      undockButton(id);
    };
  }, [id, isDocked, dockButton, undockButton]);

  // Listen for re-dock-all event from BottomDockBar
  useEffect(() => {
    const handleDockAll = () => {
      setIsDocked(true);
      dockButton(id, dockSlotIndex);
    };
    window.addEventListener('dock-all-buttons', handleDockAll);
    return () => window.removeEventListener('dock-all-buttons', handleDockAll);
  }, [id, setIsDocked, dockButton]);

  const handleDragStart = useCallback((clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    e.preventDefault(); e.stopPropagation();
    
    const currentTarget = e.currentTarget as HTMLElement;
    const rect = currentTarget.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    
    if (isDocked && !isOpenRef.current) {
      setPosition({ x: rect.left, y: rect.top });
    }
    
    const startX = clientX; const startY = clientY;
    dragStartPosRef.current = { x: clientX, y: clientY };
    wasDraggedRef.current = false;
    onDragStart?.();

    const handleMove = (moveClientX: number, moveClientY: number) => {
      const deltaX = Math.abs(moveClientX - startX);
      const deltaY = Math.abs(moveClientY - startY);
      const threshold = 5;
      
      if (deltaX > threshold || deltaY > threshold) {
        if (!wasDraggedRef.current) {
          wasDraggedRef.current = true;
          setIsOpen(false);
          setIsDragging(true);
          setDraggingButtonId(id);
        }
      }

      const clamped = constrainToViewport(moveClientX - offsetX, moveClientY - offsetY, buttonSize);
      setPosition(clamped);
      
      if (containerRef.current) {
        containerRef.current.style.left = `${clamped.x}px`;
        containerRef.current.style.top = `${clamped.y}px`;
      }

      if (forbiddenRef.current) {
        forbiddenRef.current.style.left = `${clamped.x + buttonSize / 2}px`;
        forbiddenRef.current.style.top = `${clamped.y + buttonSize / 2}px`;
      }
      
      const cursorX = clamped.x + buttonSize / 2;
      const cursorY = clamped.y + buttonSize / 2;
      setIsDraggingOverBar(isInDropZone(cursorX, cursorY));
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      setIsDragging(false);
      setIsDraggingOverBar(false);
      setDraggingButtonId(null);

      if (containerRef.current) {
        const x = parseFloat(containerRef.current.style.left);
        const y = parseFloat(containerRef.current.style.top);
        let constrained = constrainToViewport(x, y, buttonSize);

        // Check for collisions using Ref
        Object.entries(allDocksRef.current).forEach(([otherId, otherData]) => {
          if (otherId === id) return;
          const centerX = constrained.x + buttonSize / 2;
          const centerY = constrained.y + buttonSize / 2;
          const centerMenuX = otherData.x + otherData.size / 2;
          const centerMenuY = otherData.y + otherData.size / 2;
          const dist = Math.sqrt(Math.pow(centerX - centerMenuX, 2) + Math.pow(centerY - centerMenuY, 2));
          const forbiddenRadius = (buttonSize + otherData.size) / 2 + 8;
          
          if (dist < forbiddenRadius) {
            const angle = Math.atan2(centerY - centerMenuY, centerX - centerMenuX);
            const pushDist = forbiddenRadius + 10;
            constrained.x = centerMenuX + Math.cos(angle) * pushDist - buttonSize / 2;
            constrained.y = centerMenuY + Math.sin(angle) * pushDist - buttonSize / 2;
            constrained = constrainToViewport(constrained.x, constrained.y, buttonSize);
          }
        });

        const rightEdge = window.innerWidth - buttonSize;
        let edge: EdgeState = 'free';
        if (constrained.x <= 5) {
          edge = 'left'; constrained.x = 0;
        } else if (constrained.x >= rightEdge - 5) {
          edge = 'right'; constrained.x = rightEdge;
        }

        setIsSnapping(true);
        setPosition(constrained);
        setPersistedPosition(constrained);
        setEdgeState(edge);
        onDragEnd?.(constrained);
        
        const finalX = constrained.x + buttonSize / 2;
        const finalY = constrained.y + buttonSize / 2;
        
        if (isInDropZone(finalX, finalY)) {
          dockButton(id, dockSlotIndex);
          setIsDocked(true);
        } else if (isDocked && dragStartPosRef.current) {
          const startPos = dragStartPosRef.current;
          const dragDistance = Math.sqrt(Math.pow(finalX - startPos.x, 2) + Math.pow(finalY - startPos.y, 2));
          if (dragDistance > resistanceThreshold) {
            undockButton(id);
            setIsDocked(false);
          }
        }
        
        dragStartPosRef.current = null;
        setTimeout(() => setIsSnapping(false), 300);
      }
    };

    const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientX, ev.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', handleEnd);
  }, [buttonSize, id, constrainToViewport, onDragStart, onDragEnd, isInDropZone, dockButton, undockButton, isDocked, setIsDocked, setIsDraggingOverBar]);

  const handleDockedDragStart = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY, e);
  }, [handleDragStart]);

  const handleDockedClick = useCallback((e: React.MouseEvent) => {
    if (!wasDraggedRef.current) {
      const willOpen = !isOpen;
      // Only reposition when opening, not when closing
      if (willOpen) {
        const dockBarEl = document.querySelector('[data-dock-bar]') as HTMLElement;
        const barTop = dockBarEl ? dockBarEl.getBoundingClientRect().top : window.innerHeight - BAR_HEIGHT;
        setPosition({
          x: (window.innerWidth / 2) - (buttonSize / 2),
          y: barTop - buttonSize + 55
        });
      }
      setIsOpen(willOpen);
      queueMicrotask(() => setActiveDockedPopup(willOpen ? id : null));
    }
  }, [id, isOpen, setActiveDockedPopup, buttonSize]);

  // Close this popup when another docked button opens (mutual exclusion)
  useEffect(() => {
    if (isDocked && activeDockedPopup !== null && activeDockedPopup !== id) {
      setIsOpen(false);
    }
  }, [activeDockedPopup, id, isDocked]);

  useEffect(() => {
    registerDockButton({
      id, icon, color, textColor, 
      onDragStart: handleDockedDragStart, 
      onClick: handleDockedClick, 
      isOpen
    });
  }, [id, icon, color, textColor, handleDockedDragStart, handleDockedClick, registerDockButton, isOpen]);

  useEffect(() => {
    return () => unregisterDockButton(id);
  }, [id, unregisterDockButton]);

  if (!mounted) return null;

  return (
    <>
      {/* isDragging && (
        <ForbiddenZone 
          ref={forbiddenRef}
          $size={buttonSize + 16} 
          style={{ left: position.x + buttonSize/2, top: position.y + buttonSize/2 }} 
        />
      ) */}
      <FixedContainer
        ref={containerRef}
        $isSnapping={isSnapping}
        $size={buttonSize}
        $isDocked={isDocked}
        $isOpen={isOpen}
        $isDragging={isDragging}
        style={{ left: position.x, top: position.y }}
      >
        <DockButton
          $backgroundColor={color}
          $textColor={textColor}
          $isDocked={isDocked}
          $isDragging={isDragging}
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, e)}
          onMouseEnter={handleMouseEnter}
          onClick={() => !wasDraggedRef.current && setIsOpen(prev => !prev)}
        >
          {icon}
        </DockButton>

        {isOpen && (
          <>
          <PopupWrapper 
            ref={popupRef}
            $hDir={popupDirection.h} 
            $vDir={popupDirection.v} 
            $buttonSize={buttonSize} 
            $popupWidth={popupWidth}
            $isDocked={isDocked}
            onMouseEnter={handleMouseEnter}
          >
            {children}
          </PopupWrapper>

          <ToolbarFloat data-toolbar-float $hDir={popupDirection.h} $vDir={popupDirection.v} $buttonSize={buttonSize} $isDocked={isDocked} $measuredPopupWidth={measuredPopupWidth}>
            <ActionToolbar $isDocked={isDocked}>
              <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Farbe ändern">
                <MdPalette size={16} />
              </ToolbarButton>
              {!hidePinButton && (
                <ToolbarButton onClick={() => setIsPinned(!isPinned)} title={isPinned ? 'Pin lösen' : 'Dock fixieren'}>
                  {isPinned ? <FaLock size={14} /> : <FaLockOpen size={14} />}
                </ToolbarButton>
              )}
            </ActionToolbar>

            {showColorPicker && (
              <ColorPickerGrid>
                {colors.map(c => (
                  <ColorOption 
                    key={c} 
                    $color={c} 
                    $active={color === c}
                    onClick={() => { setColor(c); setShowColorPicker(false); }}
                  />
                ))}
              </ColorPickerGrid>
            )}
          </ToolbarFloat>
          </>
        )}
      </FixedContainer>
    </>
  );
};

export default BaseDockButton;

const FixedContainer = styled.div<{ $isSnapping: boolean; $size: number; $isDocked: boolean; $isOpen: boolean; $isDragging: boolean }>`
  position: fixed;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  z-index: 1000;
  pointer-events: none;
  transition: ${({ $isSnapping }) => $isSnapping ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'};
  display: ${({ $isDocked, $isOpen, $isDragging }) => 
    (!$isDocked || $isOpen || $isDragging) ? 'block' : 'none'
  };

  &:hover [data-toolbar-float] {
    opacity: 1;
  }
`;

const ForbiddenZone = styled.div<{ $size: number }>`
  position: fixed;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 2px dashed rgba(239, 68, 68, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 998;
`;

const DockButton = styled.button<{ $backgroundColor: string; $textColor: string; $isDocked: boolean; $isDragging: boolean }>`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: ${({ $isDocked, $isDragging }) => ($isDocked && !$isDragging) ? '0px 0px 0 0' : '50%'};
  background: ${({ $isDocked, $isDragging, $backgroundColor }) => {
    if ($isDocked && !$isDragging) return 'rgba(255, 255, 255, 0.3)';
    if ($backgroundColor === 'glass') return 'rgba(255, 255, 255, 0.45)';
    return $backgroundColor;
  }};
  backdrop-filter: ${({ $backgroundColor, $isDocked, $isDragging }) => ($backgroundColor === 'glass' && !($isDocked && !$isDragging)) ? 'blur(24px)' : 'none'};
  -webkit-backdrop-filter: ${({ $backgroundColor, $isDocked, $isDragging }) => ($backgroundColor === 'glass' && !($isDocked && !$isDragging)) ? 'blur(24px)' : 'none'};
  box-shadow: ${({ $isDocked, $isDragging }) => ($isDocked && !$isDragging) ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'};
  color: ${({ $textColor }) => $textColor};
  display: ${({ $isDocked, $isDragging }) => ($isDocked && !$isDragging) ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PopupWrapper = styled.div<{ $hDir: 'left' | 'right'; $vDir: 'top' | 'bottom'; $buttonSize: number; $popupWidth: number; $isDocked: boolean }>`
  position: absolute;
  width: ${({ $popupWidth }) => $popupWidth}px;
  max-width: ${({ $popupWidth }) => $popupWidth}px;
  box-sizing: border-box;
  *, *::before, *::after {
    box-sizing: border-box;
  }
  ${({ $vDir, $isDocked }) => $isDocked || $vDir === 'top'
    ? `bottom: 100%; margin-bottom: 12px;` 
    : `top: 100%; margin-top: 12px;`}
  ${({ $hDir, $isDocked }) => {
    if ($isDocked) return `left: 50%; transform: translateX(-50%);`;
    return $hDir === 'right' ? `left: 0;` : `right: 0;`;
  }}
  pointer-events: auto;
  z-index: 1001;
`;

const ToolbarFloat = styled.div<{ $hDir: 'left' | 'right'; $vDir: 'top' | 'bottom'; $buttonSize: number; $isDocked: boolean; $measuredPopupWidth: number }>`
  position: absolute;
  ${({ $vDir, $buttonSize, $isDocked, $measuredPopupWidth }) => {
    if ($isDocked) return `bottom: 100%; margin-bottom: 12px; left: calc(50% + ${$measuredPopupWidth / 2 + 10}px);`;
    return $vDir === 'top'
      ? `bottom: 100%; margin-bottom: -30px;`
      : `top: 100%; margin-top: -30px;`;
  }}
  ${({ $hDir, $isDocked }) => {
    if ($isDocked) return ``;
    return $hDir === 'right' ? `left: 80px;` : `right: 80px;`;
  }}
  pointer-events: auto;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.25s ease;

  &:hover {
    opacity: 1;
  }
`;

const ActionToolbar = styled.div<{ $isDocked?: boolean }>`
  display: flex;
  flex-direction: ${({ $isDocked }) => $isDocked ? 'column' : 'row'};
  gap: 6px;
`;

const ToolbarButton = styled.button`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: white;
    color: #111827;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ColorPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

const ColorOption = styled.button<{ $color: string; $active: boolean }>`
  width: 44px;
  height: 44px;
  background: ${({ $color }) => $color === 'glass' 
    ? 'rgba(255, 255, 255, 0.45)' 
    : $color};
  backdrop-filter: ${({ $color }) => $color === 'glass' ? 'blur(12px)' : 'none'};
  -webkit-backdrop-filter: ${({ $color }) => $color === 'glass' ? 'blur(12px)' : 'none'};
  border: 3px solid ${({ $active, $color }) => $active ? '#2563eb' : ($color === 'glass' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.6)')};
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: ${({ $active }) => $active 
    ? '0 0 0 2px #2563eb, 0 2px 8px rgba(37, 99, 235, 0.3)' 
    : '0 2px 6px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: scale(1.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

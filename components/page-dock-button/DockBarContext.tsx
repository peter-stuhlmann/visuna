'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, FC } from 'react';

type DockButtonProps = {
  id: string;
  icon: ReactNode;
  color: string;
  textColor: string;
  onDragStart: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  isOpen: boolean;
};

type DockMetadata = {
  x: number;
  y: number;
  size: number;
};

type DockedButton = {
  id: string;
  slotIndex: number; // 5 = page-dock, 6 = menu-dock
};

type DockBarContextType = {
  dockedButtons: DockedButton[];
  dockButton: (id: string, slotIndex: number) => void;
  undockButton: (id: string) => void;
  isButtonDocked: (id: string) => boolean;
  getSlotIndex: (id: string) => number | null;
  dropZoneRef: React.RefObject<HTMLDivElement> | null;
  setDropZoneRef: (ref: React.RefObject<HTMLDivElement>) => void;
  isInDropZone: (x: number, y: number) => boolean;
  isBarHovered: boolean;
  setIsBarHovered: (hovered: boolean) => void;
  isDraggingOverBar: boolean;
  setIsDraggingOverBar: (dragging: boolean) => void;
  draggingButtonId: string | null;
  setDraggingButtonId: (id: string | null) => void;
  // Button props for rendering
  registerDockButton: (props: DockButtonProps) => void;
  unregisterDockButton: (id: string) => void;
  getDockButtonProps: (id: string) => DockButtonProps | undefined;
  dockButtonsProps: Map<string, DockButtonProps>;
  // Global dock positions for collision detection
  allDocks: Record<string, DockMetadata>;
  updateDockMetadata: (id: string, data: DockMetadata | null) => void;
  // Exclusive popup: only one docked button can be open at a time
  activeDockedPopup: string | null;
  setActiveDockedPopup: (id: string | null) => void;
};

const DockBarContext = createContext<DockBarContextType | null>(null);

export const useDockBar = () => {
  const context = useContext(DockBarContext);
  if (!context) {
    throw new Error('useDockBar must be used within DockBarProvider');
  }
  return context;
};

export const DockBarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [dockedButtons, setDockedButtons] = useState<DockedButton[]>([]);
  const [dropZoneRef, setDropZoneRefState] = useState<React.RefObject<HTMLDivElement> | null>(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isDraggingOverBar, setIsDraggingOverBar] = useState(false);
  const [draggingButtonId, setDraggingButtonId] = useState<string | null>(null);
  const [dockButtonsProps, setDockButtonsProps] = useState<Map<string, DockButtonProps>>(new Map());
  const [allDocks, setAllDocks] = useState<Record<string, DockMetadata>>({});
  const [activeDockedPopup, setActiveDockedPopup] = useState<string | null>(null);

  const updateDockMetadata = useCallback((id: string, data: DockMetadata | null) => {
    setAllDocks(prev => {
      const next = { ...prev };
      if (data === null) {
        delete next[id];
      } else {
        next[id] = data;
      }
      return next;
    });
  }, []);

  const dockButton = useCallback((id: string, slotIndex: number) => {
    setDockedButtons(prev => {
      const existing = prev.find(b => b.id === id);
      if (existing) return prev;
      return [...prev, { id, slotIndex }];
    });
  }, []);

  const undockButton = useCallback((id: string) => {
    setDockedButtons(prev => prev.filter(b => b.id !== id));
  }, []);

  const isButtonDocked = useCallback((id: string) => {
    return dockedButtons.some(b => b.id === id);
  }, [dockedButtons]);

  const getSlotIndex = useCallback((id: string) => {
    const button = dockedButtons.find(b => b.id === id);
    return button ? button.slotIndex : null;
  }, [dockedButtons]);

  const setDropZoneRef = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    setDropZoneRefState(ref);
  }, []);

  const isInDropZone = useCallback((x: number, y: number) => {
    if (!dropZoneRef?.current) return false;
    const rect = dropZoneRef.current.getBoundingClientRect();
    // Extend detection zone 60px above the visible bar to account for PEEK_HEIGHT offset
    return x >= rect.left && x <= rect.right && y >= rect.top - 60 && y <= rect.bottom;
  }, [dropZoneRef]);

  const registerDockButton = useCallback((props: DockButtonProps) => {
    setDockButtonsProps(prev => {
      const existing = prev.get(props.id);
      // Skip update if only function references changed but semantic values are the same
      if (existing && existing.color === props.color && existing.textColor === props.textColor && existing.isOpen === props.isOpen) {
        return prev;
      }
      const next = new Map(prev);
      next.set(props.id, props);
      return next;
    });
  }, []);

  const unregisterDockButton = useCallback((id: string) => {
    setDockButtonsProps(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getDockButtonProps = useCallback((id: string) => {
    return dockButtonsProps.get(id);
  }, [dockButtonsProps]);

  const value = useMemo(() => ({
    dockedButtons,
    dockButton,
    undockButton,
    isButtonDocked,
    getSlotIndex,
    dropZoneRef,
    setDropZoneRef,
    isInDropZone,
    isBarHovered,
    setIsBarHovered,
    isDraggingOverBar,
    setIsDraggingOverBar,
    draggingButtonId,
    setDraggingButtonId,
    registerDockButton,
    unregisterDockButton,
    getDockButtonProps,
    dockButtonsProps,
    allDocks,
    updateDockMetadata,
    activeDockedPopup,
    setActiveDockedPopup
  }), [
    dockedButtons, dockButton, undockButton, isButtonDocked, getSlotIndex,
    dropZoneRef, setDropZoneRef, isInDropZone,
    isBarHovered, isDraggingOverBar, draggingButtonId,
    registerDockButton, unregisterDockButton, getDockButtonProps, dockButtonsProps,
    allDocks, updateDockMetadata, activeDockedPopup
  ]);

  return (
    <DockBarContext.Provider value={value}>
      {children}
    </DockBarContext.Provider>
  );
};


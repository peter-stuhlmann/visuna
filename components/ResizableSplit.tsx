// components/ResizableSplit.tsx
'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
  ReactNode,
  FC,
  KeyboardEvent,
} from 'react';
import styled, { css } from 'styled-components';
import { MdViewStream, MdViewColumn, MdViewSidebar, MdDragHandle, MdOpenInNew } from 'react-icons/md';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { setClientCookie } from './content-elements/default/utils/cookies';
import PreviewContainer from './PreviewContainer';
import { PageContext } from './PageContext';
import { useClientStorage } from './content-elements/default/utils/useLocalStorage';
import type { LanguageCode } from './language-settings/languages';
import { Icon } from './content-elements/default';
import { useOptionalPageElements } from './usePageElements';

type Props = {
  direction: 'horizontal' | 'vertical';
  area1Content: ReactNode;
  storageKey?: string;
  /** Content-Management-Sprachen des Workspaces */
  availableLanguages: LanguageCode[];
  renderArea2?: (opts: { ensureVisible: () => void }) => ReactNode;
  area2Style?: React.CSSProperties;
  area1Style?: React.CSSProperties;
  
  // Initial SSR values (from Cookies)
  initialSize?: number;
  initialOrientation?: 'horizontal' | 'vertical';
  initialFlipped?: boolean;
};

const DOCK_MOBILE_HEIGHT = 70;

const Wrapper = styled.div<{ direction: Props['direction']; $isVertical: boolean }>`
  display: flex;
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  flex-direction: ${({ direction }) =>
    direction === 'horizontal' ? 'row' : 'column'};
  overflow: hidden;

  @media (max-width: 480px) {
    ${({ $isVertical }) => $isVertical && `
      height: calc(100vh - ${DOCK_MOBILE_HEIGHT}px);
    `}
  }
`;

const Area = styled.div<{ $area: 'area-1' | 'area-2' }>`
  flex: ${({ $area }) => ($area === 'area-1' ? '0 0 auto' : '1 0 0px')};
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  ${css`
    container-type: inline-size;
    container-name: resizable-area;
  `}
`;

const Resizer = styled.div<{ direction: Props['direction'] }>`
  cursor: ${({ direction }) =>
    direction === 'horizontal' ? 'col-resize' : 'row-resize'};
  display: flex;
  align-items: center;
  justify-content: ${({ direction }) =>
    direction === 'horizontal' ? 'flex-start' : 'flex-end'};
  flex-direction: ${({ direction }) =>
    direction === 'horizontal' ? 'column' : 'row'};
  position: relative;
  
  width: ${({ direction }) => (direction === 'horizontal' ? '12px' : '100%')};
  height: ${({ direction }) => (direction === 'horizontal' ? '100%' : '12px')};
  
  background-color: #e5e7eb;
  border-radius: 1000px;
  margin: 0;
  padding: 4px;
  
  transition: background-color 0.2s;
  z-index: 50;

  &:hover {
    background-color: #d1d5db;
  }

  /* Touch Area Expansion */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    transform: ${({ direction }) => direction === 'horizontal' ? 'scaleX(3)' : 'scaleY(3)'};
    z-index: -1;
  }

  touch-action: none; 
`;

const FlipButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.1);
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  border-radius: 50%;
  position: absolute;
  top: 0;
  position: absolute;
  top: 0;
  z-index: 10;
  color: #555;
  transition: all 0.2s;
  pointer-events: auto;

  &:hover {
    background: #f9fafb;
    color: #000;
    transform: scale(1.1);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const LayoutMenu = styled.div<{ $isHorizontal: boolean; $openLeft: boolean }>`
  position: absolute;
  top: ${({ $isHorizontal }) => $isHorizontal ? '0' : '32px'};
  left: ${({ $isHorizontal, $openLeft }) => $isHorizontal ? ($openLeft ? 'auto' : '32px') : 'auto'};
  right: ${({ $isHorizontal, $openLeft }) => $isHorizontal ? ($openLeft ? '32px' : 'auto') : '0'};
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
  min-width: 140px;
  pointer-events: auto;
`;

const LayoutOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: ${({ $active }) => $active ? '#f0f9ff' : 'transparent'};
  color: ${({ $active }) => $active ? '#0284c7' : '#333'};
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.1s;

  &:hover {
    background: ${({ $active }) => $active ? '#e0f2fe' : '#f3f4f6'};
  }
  
  svg {
    opacity: 0.7;
  }
`;

const ResizableSplit: FC<Props> = ({
  direction,
  area1Content,
  storageKey = 'resizable-split',
  availableLanguages,
  renderArea2,
  area2Style,
  area1Style,
  initialSize = 0,
  initialOrientation,
  initialFlipped = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const area1Ref = useRef<HTMLDivElement>(null);
  const area2Ref = useRef<HTMLDivElement>(null);

  // --- Cookie / State Management ---
  const [area1Size, setArea1Size] = useState<number>(initialSize);
  const [isFlipped, setFlippedState] = useState<boolean>(initialFlipped);
  const [orientationState, setOrientationState] = useState<'horizontal' | 'vertical'>(
    initialOrientation || direction
  );

  // Helpers to update state AND cookies
  const setSize = useCallback((size: number) => {
    setArea1Size(size);
    setClientCookie(`${storageKey}-size`, size);
  }, [storageKey]);

  const setFlipped = useCallback((flipped: boolean) => {
    setFlippedState(flipped);
    setClientCookie(`${storageKey}-flipped`, flipped);
  }, [storageKey]);

  const setOrientation = useCallback((o: 'horizontal' | 'vertical') => {
    setOrientationState(o);
    setClientCookie(`${storageKey}-orientation`, o);
  }, [storageKey]);

  const pageContext = useContext(PageContext);
  const page = pageContext?.page;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDirection = orientationState;
  const isHorizontal = currentDirection === 'horizontal';
  const prop: 'width' | 'height' = isHorizontal ? 'width' : 'height';

  // Für ARIA: aktueller Prozentwert (0–100)
  const [percent, setPercent] = useState<number>(0);

  const getSizes = useCallback(() => {
    const wrapper = wrapperRef.current;
    const resizer = resizerRef.current;
    const a1 = area1Ref.current;
    if (!wrapper || !resizer || !a1) return { usable: 0, a1px: 0 };

    const containerSize = wrapper.getBoundingClientRect()[prop];
    const resizerSize =
      resizer.getBoundingClientRect()[isHorizontal ? 'width' : 'height'] || 0;
    const usable = Math.max(0, containerSize - resizerSize);
    const a1px = a1.getBoundingClientRect()[prop];
    return { usable, a1px };
  }, [isHorizontal, prop]);

  const updatePercentFromDOM = useCallback(() => {
    const { usable, a1px } = getSizes();
    const p = usable > 0 ? Math.round((a1px / usable) * 100) : 0;
    setPercent(Math.max(0, Math.min(100, p)));
  }, [getSizes]);

  const clampToContainer = useCallback(
    (desired: number) => {
      const wrapper = wrapperRef.current;
      const resizer = resizerRef.current;
      if (!wrapper || !resizer) return desired;

      const containerSize = wrapper.getBoundingClientRect()[prop];
      const resizerSize =
        resizer.getBoundingClientRect()[isHorizontal ? 'width' : 'height'] || 0;

      const maxArea1 = Math.max(0, containerSize - resizerSize);
      return Math.min(Math.max(0, desired), maxArea1);
    },
    [isHorizontal, prop]
  );

  const setPercentSize = useCallback(
    (p: number) => {
      const wrapper = wrapperRef.current;
      const resizer = resizerRef.current;
      // Area 1 width is controlled via state/style now
      const a2 = area2Ref.current;
      if (!wrapper || !resizer || !a2) return;

      const resizerSize =
        resizer.getBoundingClientRect()[isHorizontal ? 'width' : 'height'] || 0;

      const wrapperSize = wrapper.getBoundingClientRect()[prop];
      const usable = Math.max(0, wrapperSize - resizerSize);
      const px = clampToContainer(
        (usable * Math.max(0, Math.min(100, p))) / 100
      );

      setSize(px);
      // a1 style is updated via re-render using area1Size
      a2.style.flex = '1 0';
      setPercent(Math.round((px / (usable || 1)) * 100));
    },
    [isHorizontal, prop, setSize, clampToContainer]
  );

  // Initial percent calculation on mount
  useEffect(() => {
    updatePercentFromDOM();
  }, [updatePercentFromDOM]);

  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const isH = isHorizontal;
    const dimension = prop;

    function handleMove(client: number) {
      const r = resizerRef.current;
      if (!r) return;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prev = (r as any)._client ?? client;
      const delta = client - prev;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r as any)._client = client;

      const a1 = r.previousElementSibling as HTMLElement | null;
      const a2 = r.nextElementSibling as HTMLElement | null;
      if (!a1 || !a2) return;

      const effectiveDelta = isFlipped ? -delta : delta;

      // Temporary logic for smooth dragging (direct DOM manipulation)
      // We will commit to state on stop
      const currentSize = a1.getBoundingClientRect()[dimension];
      const newSize = currentSize + effectiveDelta;
      
      const clamped = clampToContainer(newSize);
      
      a1.style.flex = `0 0 ${clamped}px`;
      a2.style.flex = '1 0';
    }

    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      handleMove(isH ? e.clientX : e.clientY);
    }
    
    function onTouchMove(e: TouchEvent) {
       if (e.cancelable) e.preventDefault();
       const touch = e.touches[0];
       handleMove(isH ? touch.clientX : touch.clientY);
    }

    function stop() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stop);
      
      const r = resizerRef.current;
      if (r) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (r as any)._client;
      }

      const a1 = area1Ref.current;
      if (a1) {
        const raw = a1.getBoundingClientRect()[dimension];
        const clamped = clampToContainer(raw);
        
        // Commit to state and cookie
        setSize(clamped);
        updatePercentFromDOM();
      }
    }

    function startMouse(e: MouseEvent) {
      const r = resizerRef.current;
      if (!r) return;
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r as any)._client = isH ? e.clientX : e.clientY;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stop);
    }

    function startTouch(e: TouchEvent) {
      const r = resizerRef.current;
      if (!r) return;
      
      // Don't start resize drag if touching a button or interactive element
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;
      
      if (e.cancelable) e.preventDefault();
      
      const touch = e.touches[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r as any)._client = isH ? touch.clientX : touch.clientY;
      
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', stop);
    }

    function handleDoubleClick() {
      const wrap = wrapperRef.current;
      const a2 = area2Ref.current;
      if (!wrap || !a2) return;

      const containerSize = wrap.getBoundingClientRect()[dimension];
      const half = clampToContainer(containerSize / 2);
      
      setSize(half);
      a2.style.flex = '1 0';
      updatePercentFromDOM();
    }

    resizer.addEventListener('mousedown', startMouse);
    resizer.addEventListener('touchstart', startTouch, { passive: false });
    resizer.addEventListener('dblclick', handleDoubleClick);
    return () => {
      resizer.removeEventListener('mousedown', startMouse);
      resizer.removeEventListener('touchstart', startTouch);
      resizer.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [isHorizontal, prop, clampToContainer, isFlipped, setSize, updatePercentFromDOM]);

  useEffect(() => {
    let raf = 0;

    const applyClamp = () => {
      const wrap = wrapperRef.current;
      const a1 = area1Ref.current;
      const a2 = area2Ref.current;
      if (!wrap || !a1 || !a2) return;

      const current = a1.getBoundingClientRect()[prop];
      if (!Number.isFinite(current)) return;

      const clamped = clampToContainer(current);
      if (Math.abs(clamped - current) > 1) { // Threshold to avoid unnecessary updates
        // This effect is for responsiveness.
        // It directly manipulates the DOM for smooth resizing,
        // but we should also sync the state if the size changes significantly.
        // For now, we let the user interaction (drag/double click) update the state.
        // If the window resize causes a clamp, we should update the state.
        setSize(clamped); // Sync state with clamped value
        a1.style.flex = `0 0 ${clamped}px`;
        a2.style.flex = '1 0';
      }
      updatePercentFromDOM();
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyClamp);
    };

    const ro = new ResizeObserver(() => schedule());
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    const onWindowResize = () => schedule();
    window.addEventListener('resize', onWindowResize);

    return () => {
      cancelAnimationFrame(raf);
      try {
        ro.disconnect();
      } catch {}
      window.removeEventListener('resize', onWindowResize);
    };
  }, [prop, isHorizontal, updatePercentFromDOM, clampToContainer, setSize]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    if (isHorizontal) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPercentSize(percent - step);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPercentSize(percent + step);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPercentSize(percent + step);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPercentSize(percent - step);
      }
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setPercentSize(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      setPercentSize(100);
    }
  };

  const area1Id = 'split-area-1';
  const area2Id = 'split-area-2';

  const ensureEditAreaVisible = useCallback(() => {
    const a1 = area1Ref.current;
    if (!a1) return;
    const width = a1.getBoundingClientRect().width;
    
    // Wenn kleiner als 100px, auf 50% aufziehen
    if (width < 100) {
      setPercentSize(50);
    }
  }, [setPercentSize]);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [menuOpenLeft, setMenuOpenLeft] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Check available space and set menu direction
  useEffect(() => {
    if (isMenuOpen && menuRef.current && isHorizontal) {
      const menuButton = menuRef.current.querySelector('button');
      if (menuButton) {
        const buttonRect = menuButton.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const spaceOnRight = viewportWidth - buttonRect.right;
        const menuWidth = 140; // min-width of LayoutMenu
        
        // If not enough space on right (need at least menuWidth + 50px margin), open left
        setMenuOpenLeft(spaceOnRight < menuWidth + 50);
      }
    }
  }, [isMenuOpen, isHorizontal]);

  // Handle Menu Click
  const handleLayoutChange = (newOrientation: 'horizontal' | 'vertical', newFlipped: boolean) => {
    const isOrientationChange = newOrientation !== orientationState;
    const isFlippedChange = newFlipped !== isFlipped;

    if (!isOrientationChange && isFlippedChange) {
       // Smart flip logic: adjust Area 1 size to maintain visual separator position
       const wrap = wrapperRef.current;
       const res = resizerRef.current;
       const a1 = area1Ref.current;
       if (wrap && res && a1) {
          const wrapperSize = wrap.getBoundingClientRect()[prop];
          const resizerSize = res.getBoundingClientRect()[prop];
          const currentA1Size = a1.getBoundingClientRect()[prop];
          const newSize = Math.max(0, wrapperSize - resizerSize - currentA1Size);
          setSize(newSize);
          const usable = Math.max(0, wrapperSize - resizerSize);
          setPercent(Math.round((newSize / (usable || 1)) * 100));
       }
    }
    
    setOrientation(newOrientation);
    setFlipped(newFlipped);
    setMenuOpen(false);
  };

  // BroadcastChannel: send page changes to external preview windows
  useEffect(() => {
    if (!page?._id) return;
    const wsMatch = window.location.pathname.match(/\/workspaces\/([^/]+)/);
    if (!wsMatch) return;
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'page-change', pageId: page._id, workspaceId: wsMatch[1] });
    return () => channel.close();
  }, [page?._id]);

  // BroadcastChannel: send live content updates to external preview
  const peCtx = useOptionalPageElements();
  const liveElements = peCtx?.pageElements;
  const revision = peCtx?.revision;
  const setLiveElements = peCtx?.setPageElements;
  const updateLiveElement = peCtx?.updatePageElement;
  const initialRevisionRef = useRef(true);
  const skipBroadcastCountRef = useRef(0);
  const liveElementsRef = useRef(liveElements);
  liveElementsRef.current = liveElements;

  useEffect(() => {
    if (!peCtx) return; // No page context, skip broadcast
    // Skip the initial render (only broadcast actual edits)
    if (initialRevisionRef.current) {
      initialRevisionRef.current = false;
      return;
    }
    // Skip if this revision was triggered by receiving a remote update
    if (skipBroadcastCountRef.current > 0) {
      skipBroadcastCountRef.current -= 1;
      return;
    }
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'content-update', pageElements: liveElements });
    channel.close();
  }, [revision, peCtx, liveElements]);

  // BroadcastChannel: listen for edit requests, content updates, and state requests from external preview
  useEffect(() => {
    if (!peCtx || !setLiveElements || !updateLiveElement) return; // No page context, skip
    const channel = new BroadcastChannel('preview-sync');
    channel.onmessage = (event) => {
      const { type } = event.data || {};

      if (type === 'edit-element') {
        const { editId } = event.data;
        if (editId) {
          const sp = new URLSearchParams(searchParams.toString());
          sp.set('mode', 'edit-element');
          sp.set('editId', editId);
          sp.delete('afterId');
          router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

          // Ensure edit area is visible
          const a1 = area1Ref.current;
          if (a1 && a1.getBoundingClientRect().width < 100) {
            setPercentSize(50);
          }
        }
      }

      if (type === 'create-element') {
        const { afterId } = event.data;
        const sp = new URLSearchParams(searchParams.toString());
        sp.set('mode', 'create-element');
        sp.delete('editId');
        if (afterId) sp.set('afterId', afterId);
        else sp.delete('afterId');
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

        // Ensure edit area is visible
        const a1 = area1Ref.current;
        if (a1 && a1.getBoundingClientRect().width < 100) {
          setPercentSize(50);
        }
      }

      if (type === 'content-update-from-external') {
        const { pageElements: updatedElements } = event.data;
        if (Array.isArray(updatedElements)) {
          skipBroadcastCountRef.current += 1;
          setLiveElements(updatedElements);
        }
      }

      if (type === 'visibility-change') {
        const { elementId, visible } = event.data;
        if (elementId !== undefined && visible !== undefined) {
          skipBroadcastCountRef.current += 1;
          updateLiveElement(elementId, { visible });
        }
      }

      if (type === 'state-request') {
        // External preview is requesting the latest state (e.g. after refresh)
        const responseChannel = new BroadcastChannel('preview-sync');
        responseChannel.postMessage({ type: 'state-response', pageElements: liveElementsRef.current });
        responseChannel.close();
      }
    };
    return () => channel.close();
  }, [router, pathname, searchParams, setPercentSize, setLiveElements, updateLiveElement, peCtx]);

  // Relay pe-scroll-to events to external preview via BroadcastChannel
  useEffect(() => {
    const onScrollTo = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      const channel = new BroadcastChannel('preview-sync');
      channel.postMessage({ type: 'scroll-to-element', elementId: id });
      channel.close();
    };
    window.addEventListener('pe-scroll-to', onScrollTo as EventListener);
    return () => window.removeEventListener('pe-scroll-to', onScrollTo as EventListener);
  }, []);

  // Language sync: broadcast changes from internal preview to external
  const handleLanguageChange = useCallback((lang: LanguageCode) => {
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'language-change', language: lang });
    channel.close();
  }, []);

  // Language sync: listen for language changes from external preview
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'language-change-from-external') {
        const { language } = event.data;
        if (language) {
          window.dispatchEvent(
            new CustomEvent('preview-language-change', { detail: { language } })
          );
        }
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.close();
  }, []);

  return (
    <Wrapper 
      ref={wrapperRef} 
      direction={currentDirection}
      $isVertical={!isHorizontal}
      style={{ flexDirection: currentDirection === 'horizontal' ? (isFlipped ? 'row-reverse' : 'row') : (isFlipped ? 'column-reverse' : 'column') }}
    >
      {/* Apply width/height directly via style for SSR */}
      <Area 
         id={area1Id} 
         ref={area1Ref} 
         $area="area-1" 
         style={{ 
            ...area1Style, 
            flex: `0 0 ${area1Size}px`
         }}
      >
        {area1Content}
      </Area>

      <Resizer
        ref={resizerRef}
        className="resizer"
        direction={currentDirection}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-controls={`${area1Id} ${area2Id}`}
        aria-label="Größenanpassung der Bereiche"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div 
          style={{ 
             position: 'absolute', 
             top: '50%', 
             left: '50%', 
             transform: `translate(-50%, -50%) ${isHorizontal ? 'rotate(90deg)' : 'rotate(0deg)'}`, 
             pointerEvents: 'none',
             opacity: 0.4,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
          }}
        >
          <MdDragHandle size={24} />
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
            <FlipButton 
              title="Layout ändern"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!isMenuOpen);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={isMenuOpen ? 'active' : ''}
              style={{ position: 'static' }}
            >
               <Icon name="MdWindow" size={16} />
            </FlipButton>
            
            {isMenuOpen && (
              <LayoutMenu $isHorizontal={isHorizontal} $openLeft={menuOpenLeft}>
                 <LayoutOption onClick={() => handleLayoutChange('horizontal', false)} $active={isHorizontal && !isFlipped}>
                   <MdViewSidebar />
                   <span>Links / Rechts</span>
                 </LayoutOption>
                 <LayoutOption onClick={() => handleLayoutChange('horizontal', true)} $active={isHorizontal && isFlipped}>
                   <MdViewSidebar style={{ transform: 'scaleX(-1)' }} />
                   <span>Rechts / Links</span>
                 </LayoutOption>
                 <LayoutOption onClick={() => handleLayoutChange('vertical', false)} $active={!isHorizontal && !isFlipped}>
                    <MdViewColumn style={{ transform: 'rotate(90deg)' }} />
                   <span>Oben / Unten</span>
                 </LayoutOption>
                 <LayoutOption onClick={() => handleLayoutChange('vertical', true)} $active={!isHorizontal && isFlipped}>
                   <MdViewColumn style={{ transform: 'rotate(-90deg)' }} />
                   <span>Unten / Oben</span>
                 </LayoutOption>
                 <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '4px 0' }} />
                 <LayoutOption
                   $active={false}
                   onClick={() => {
                     const wsMatch = window.location.pathname.match(/\/workspaces\/([^/]+)/);
                     const wsId = wsMatch?.[1];
                     const pId = page?._id;
                     if (wsId && pId) {
                       window.open(`/workspaces/${wsId}/seiten/${pId}/preview`, 'external-preview', 'width=1280,height=900,menubar=no,toolbar=no,location=yes,status=no');
                     }
                     setMenuOpen(false);
                   }}
                 >
                   <MdOpenInNew />
                   <span>Extern</span>
                 </LayoutOption>
              </LayoutMenu>
            )}
        </div>
      </Resizer>

      <Area id={area2Id} ref={area2Ref} $area="area-2" style={area2Style}>
        {renderArea2 ? (
          renderArea2({ ensureVisible: ensureEditAreaVisible })
        ) : (
          page &&
          page.pageElements && (
            <PreviewContainer
              pageElements={page.pageElements}
              availableLanguages={availableLanguages}
              onEnsureEditVisible={ensureEditAreaVisible}
              onLanguageChange={handleLanguageChange}
              isPagePreview
            />
          )
        )}
      </Area>
    </Wrapper>
  );
};

export default ResizableSplit;

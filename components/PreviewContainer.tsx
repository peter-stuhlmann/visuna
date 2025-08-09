'use client';

import React, {
  FC,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IntroText, ContactMap } from './content-elements/default';
import styled from 'styled-components';
import { PageElement } from './content-elements/default/types';
import { MdGridOn, MdGridOff } from 'react-icons/md';
import { useClientStorage } from './content-elements/default/utils/useLocalStorage';
import { usePageElements } from './usePageElements';
import { withElementDefaults } from '@/data/page-elements-defaults';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentsMap: Record<string, FC<any>> = {
  'intro-text': IntroText,
  'contact-map': ContactMap,
};

type PreviewContainerProps = {
  pageElements: PageElement[];
};

const escapeCss = (value: string) => value.replace(/["\\]/g, '\\$&');

/** Nächsten vertikal scrollbaren Parent finden */
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

/** Element in einem bestimmten Scroll-Container zentrieren (sanft) */
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

const PreviewContainer: FC<PreviewContainerProps> = ({ pageElements }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledIdRef = useRef<string | null>(null);
  const hoveredElRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [overlayVisible, setOverlayVisible] = useClientStorage<boolean>(
    'overlay-visible',
    false,
    'local'
  );

  const { pageElements: ctxElements, editingElementId } = usePageElements();

  const effectiveElements = useMemo(
    () => (ctxElements?.length ? ctxElements : pageElements) ?? [],
    [ctxElements, pageElements]
  );

  // Größe nur messen, wenn Overlay sichtbar ist
  useEffect(() => {
    if (
      !overlayVisible ||
      !containerRef.current ||
      typeof ResizeObserver === 'undefined'
    )
      return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [overlayVisible]);

  // Helper: in Sicht (relativ zum Scroll-Container)?
  const isInView = (container: HTMLElement, el: HTMLElement) => {
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.top >= c.top && r.bottom <= c.bottom;
  };

  // Automatisch scrollen beim Wechsel der editingElementId (nur wenn out-of-view)
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

  // Direktes Scrollen bei Edit-Button (pe-scroll-to)
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
      }
    };

    window.addEventListener('pe-scroll-to', onScrollTo as EventListener);
    return () =>
      window.removeEventListener('pe-scroll-to', onScrollTo as EventListener);
  }, []);

  // Imperativer Hover-Bridge (keine Re-Renders beim Hovern)
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

  return (
    <Container ref={containerRef} $overlayVisible={overlayVisible}>
      <PreviewSettingsContainer>
        {overlayVisible && (
          <Resolution>
            Auflösung: {Math.max(0, dimensions.width - 4)}px ×{' '}
            {Math.max(0, dimensions.height - 4)}px
          </Resolution>
        )}
        <OverlayVisibilityButton
          onClick={() => setOverlayVisible((v) => !v)}
          aria-label="Layout-Overlay umschalten"
          title="Layout-Overlay umschalten"
        >
          <div>{overlayVisible ? <MdGridOff /> : <MdGridOn />}</div>
        </OverlayVisibilityButton>
      </PreviewSettingsContainer>

      {effectiveElements.map((el) => (
        <PageElementRenderer
          key={el._id}
          element={el}
          isEditing={String(el._id) === String(editingElementId)}
        />
      ))}
    </Container>
  );
};

export default PreviewContainer;

const PageElementRenderer: FC<{ element: PageElement; isEditing: boolean }> =
  React.memo(
    ({ element, isEditing }) => {
      const Component = componentsMap[element.element];

      // Hooks immer aufrufen
      const mergedData = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => withElementDefaults(element.element as any, element.data),
        [element.element, element.data]
      );

      const deferredData = useDeferredValue(mergedData);

      if (!Component) return null;

      return (
        <div
          className={`page-element${isEditing ? ' is-editing' : ''}`}
          data-id={element._id}
        >
          <div className="helper-grid" />
          <Component data={deferredData} />
        </div>
      );
    },
    (prev, next) =>
      prev.element._id === next.element._id &&
      prev.element.element === next.element.element &&
      prev.element.data === next.element.data &&
      prev.isEditing === next.isEditing
  );

PageElementRenderer.displayName = 'PageElementRenderer';

const Container = styled.div<{ $overlayVisible?: boolean }>`
  box-sizing: border-box;
  min-width: 324px;
  background-color: #fff;
  position: relative;

  & > div.page-element {
    position: relative;

    &.is-editing {
      div.helper-grid {
        border-top: 2px solid transparent; /* Platzhalterbreite */
        border-bottom: 2px solid transparent; /* Platzhalterbreite */
        border-image: repeating-linear-gradient(
            to right,
            red 0,
            red 8px,
            white 8px,
            white 16px
          )
          8;
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
      pointer-events: none; /* UI nicht blockieren */
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
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  height: 28px;
  font-size: 0.875rem;
  border: 1px solid #ffffff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  user-select: none;
  box-sizing: border-box;
`;

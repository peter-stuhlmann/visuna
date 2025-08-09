'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import PreviewContainer from './PreviewContainer';
import { usePage } from './PageContext';
import { useClientStorage } from './content-elements/default/utils/useLocalStorage';

type Props = {
  direction: 'horizontal' | 'vertical';
  area1Content: React.ReactNode;
  storageKey?: string;
};

const Wrapper = styled.div<{ direction: Props['direction'] }>`
  display: flex;
  height: 100vh;
  flex: 1;
  flex-direction: ${({ direction }) =>
    direction === 'horizontal' ? 'row' : 'column'};
  overflow: hidden;
`;

const Area = styled.div<{ $area: 'area-1' | 'area-2' }>`
  flex: 0 0 ${({ $area }) => ($area === 'area-1' ? '0' : '100%')};
  height: 100%;
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
  justify-content: center;
  flex-direction: ${({ direction }) =>
    direction === 'horizontal' ? 'row' : 'column'};
  position: relative;
  width: ${({ direction }) => (direction === 'horizontal' ? '24px' : '24px')};

  &::before {
    content: '';
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 1rem;
    width: ${({ direction }) => (direction === 'horizontal' ? '24px' : '24px')};
    height: ${({ direction }) => (direction === 'horizontal' ? '100%' : '2px')};
    transition: all 0.2s ease-in-out;
    transition-delay: 0s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::after {
    content: '||';
    position: absolute;
    left: calc(50% - 4px);
    width: ${({ direction }) => (direction === 'horizontal' ? '2px' : '24px')};
    height: ${({ direction }) => (direction === 'horizontal' ? '24px' : '2px')};
  }

  &:hover::before {
    width: ${({ direction }) => (direction === 'horizontal' ? '44px' : '24px')};
    height: ${({ direction }) => (direction === 'horizontal' ? '100%' : '2px')};
    background-color: rgba(0, 0, 0, 0.1);
    transition-delay: 0.1s;
  }
`;

const ResizableSplit: React.FC<Props> = ({
  direction,
  area1Content,
  storageKey = 'resizable-split',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const area1Ref = useRef<HTMLDivElement>(null);
  const area2Ref = useRef<HTMLDivElement>(null);

  const [prefs, setPrefs] = useClientStorage<{ area1Size: number }>(
    storageKey,
    { area1Size: 0 },
    'local'
  );

  const { page } = usePage();

  const isHorizontal = direction === 'horizontal';
  const prop: 'width' | 'height' = isHorizontal ? 'width' : 'height';

  // Für ARIA: aktueller Prozentwert (0–100)
  const [percent, setPercent] = useState<number>(0);

  const getSizes = useCallback(() => {
    const wrapper = wrapperRef.current;
    const resizer = wrapper?.querySelector('.resizer') as HTMLDivElement | null;
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

  // Clamp helper als stabile Callback-Ref
  const clampToContainer = useCallback(
    (desired: number) => {
      const wrapper = wrapperRef.current;
      const resizer = wrapper?.querySelector(
        '.resizer'
      ) as HTMLDivElement | null;
      if (!wrapper || !resizer) return desired;

      const containerSize = wrapper.getBoundingClientRect()[prop];
      const resizerSize =
        resizer.getBoundingClientRect()[isHorizontal ? 'width' : 'height'] || 0;

      const maxArea1 = Math.max(0, containerSize - resizerSize);
      return Math.min(Math.max(0, desired), maxArea1);
    },
    [isHorizontal, prop]
  );

  // Setzen per Prozent (für Tastatur & Presets)
  const setPercentSize = useCallback(
    (p: number) => {
      if (!wrapperRef.current || !area1Ref.current || !area2Ref.current) return;
      const wrapperSize = wrapperRef.current.getBoundingClientRect()[prop];
      const resizer = wrapperRef.current.querySelector(
        '.resizer'
      ) as HTMLDivElement | null;
      const resizerSize =
        resizer?.getBoundingClientRect()[isHorizontal ? 'width' : 'height'] ||
        0;
      const usable = Math.max(0, wrapperSize - resizerSize);
      const px = clampToContainer(
        (usable * Math.max(0, Math.min(100, p))) / 100
      );

      area1Ref.current.style.flex = `0 0 ${px}px`;
      area2Ref.current.style.flex = '1 0';
      setPrefs({ area1Size: px });
      setPercent(Math.round((px / (usable || 1)) * 100));
    },
    [isHorizontal, prop, setPrefs, clampToContainer]
  );

  // Initial gespeicherte Größe anwenden
  useEffect(() => {
    if (!area1Ref.current || !area2Ref.current || !prefs) return;
    const clamped = clampToContainer(Number(prefs.area1Size) || 0);
    area1Ref.current.style.flex = `0 0 ${clamped}px`;
    area2Ref.current.style.flex = '1 0';
    updatePercentFromDOM();
  }, [prefs, updatePercentFromDOM, clampToContainer]);

  // Drag-Handling (wie gehabt) + Percent/Prefs aktualisieren
  useEffect(() => {
    const resizer = wrapperRef.current?.querySelector(
      '.resizer'
    ) as HTMLDivElement;
    if (!resizer) return;

    const isH = isHorizontal;
    const dimension = prop;

    function handleMove(e: MouseEvent) {
      e.preventDefault();
      const client = isH ? e.clientX : e.clientY;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delta = client - ((resizer as any)._client || client);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resizer as any)._client = client;

      const a1 = resizer.previousElementSibling as HTMLElement;
      const a2 = resizer.nextElementSibling as HTMLElement;
      if (!a1 || !a2) return;

      if (delta < 0) {
        const size = a1.getBoundingClientRect()[dimension] + delta;
        const min = isH ? 0 : 10;
        a1.style.flex = `0 0 ${Math.max(size, min)}px`;
        a2.style.flex = '1 0';
      } else {
        const size = a2.getBoundingClientRect()[dimension] - delta;
        const min = isH ? 0 : 10;
        a2.style.flex = `0 0 ${Math.max(size, min)}px`;
        a1.style.flex = '1 0';
      }
    }

    function stop() {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stop);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (resizer as any)._client;

      if (area1Ref.current) {
        const raw = area1Ref.current.getBoundingClientRect()[dimension];
        const clamped = clampToContainer(raw);
        area1Ref.current.style.flex = `0 0 ${clamped}px`;
        setPrefs({ area1Size: clamped });
        updatePercentFromDOM();
      }
    }

    function start(e: MouseEvent) {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resizer as any)._client = isH ? e.clientX : e.clientY;
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', stop);
    }

    function handleDoubleClick() {
      if (!wrapperRef.current || !area1Ref.current) return;
      const containerSize =
        wrapperRef.current.getBoundingClientRect()[dimension];
      const half = clampToContainer(containerSize / 2);
      area1Ref.current.style.flex = `0 0 ${half}px`;
      area2Ref.current!.style.flex = '1 0';
      setPrefs({ area1Size: half });
      updatePercentFromDOM();
    }

    resizer.addEventListener('mousedown', start);
    resizer.addEventListener('dblclick', handleDoubleClick);
    return () => {
      resizer.removeEventListener('mousedown', start);
      resizer.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [isHorizontal, prop, setPrefs, updatePercentFromDOM, clampToContainer]);

  // Reagieren auf Container-/Viewport-Änderungen
  useEffect(() => {
    if (!wrapperRef.current || !area1Ref.current || !area2Ref.current) return;

    const applyClamp = () => {
      const current = area1Ref.current!.getBoundingClientRect()[prop];
      const clamped = clampToContainer(current);
      if (clamped !== current) {
        area1Ref.current!.style.flex = `0 0 ${clamped}px`;
        area2Ref.current!.style.flex = '1 0';
      }
      updatePercentFromDOM();
    };

    const ro = new ResizeObserver(() => applyClamp());
    ro.observe(wrapperRef.current);

    const onWindowResize = () => applyClamp();
    window.addEventListener('resize', onWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [prop, isHorizontal, updatePercentFromDOM, clampToContainer]);

  // Tastatursteuerung
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

  // IDs für aria-controls (optional)
  const area1Id = 'split-area-1';
  const area2Id = 'split-area-2';

  return (
    <Wrapper ref={wrapperRef} direction={direction}>
      <Area id={area1Id} ref={area1Ref} $area="area-1">
        {area1Content}
      </Area>

      <Resizer
        className="resizer"
        direction={direction}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-controls={`${area1Id} ${area2Id}`}
        aria-label="Größenanpassung der Bereiche"
        tabIndex={0}
        onKeyDown={onKeyDown}
      />

      <Area id={area2Id} ref={area2Ref} $area="area-2">
        {page && page.pageElements && (
          <PreviewContainer pageElements={page.pageElements} />
        )}
      </Area>
    </Wrapper>
  );
};

export default ResizableSplit;

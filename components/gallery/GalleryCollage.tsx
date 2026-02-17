'use client';

import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import styled from 'styled-components';
import type { GalleryItem, GalleryProps } from './types';
import Image from 'next/image';
import Lightbox from './Lightbox';
import { Icon } from '@/components/content-elements/default';
import { SkeletonOverlay } from './SkeletonImage';

/* --------------------------------- Types ---------------------------------- */

type JustifiedRow = {
  items: GalleryItem[];
  height: number;
  /** True when items naturally overflow → row fills the full container width */
  isFull: boolean;
};

/* ----------------------- Justified Row Algorithm -------------------------- */

function computeRows(
  items: GalleryItem[],
  containerWidth: number,
  targetRowHeight: number,
  gap: number,
): JustifiedRow[] {
  if (containerWidth <= 0 || items.length === 0) return [];

  const rows: JustifiedRow[] = [];
  let currentRow: GalleryItem[] = [];
  let currentWidth = 0;

  for (const item of items) {
    const ar = item.width && item.height ? item.width / item.height : 1;
    const scaledWidth = ar * targetRowHeight;
    const gapExtra = currentRow.length > 0 ? gap : 0;

    if (currentWidth + scaledWidth + gapExtra > containerWidth && currentRow.length > 0) {
      const totalGap = (currentRow.length - 1) * gap;
      const availableWidth = containerWidth - totalGap;
      const totalAr = currentRow.reduce((sum, it) => {
        const a = it.width && it.height ? it.width / it.height : 1;
        return sum + a;
      }, 0);
      // Full row: height = W / Σar — guarantees correct aspect ratios
      const rowHeight = availableWidth / totalAr;

      rows.push({ items: currentRow, height: rowHeight, isFull: true });
      currentRow = [];
      currentWidth = 0;
    }

    currentRow.push(item);
    currentWidth += scaledWidth + (currentRow.length > 1 ? gap : 0);
  }

  // Last (incomplete) row: use target height, don't stretch to fill
  if (currentRow.length > 0) {
    rows.push({ items: currentRow, height: targetRowHeight, isFull: false });
  }

  return rows;
}

/* --------------------------------- Styles --------------------------------- */

const Container = styled.div`
  width: 100%;
`;

const Row = styled.div<{ $gap: number }>`
  display: flex;
  gap: ${({ $gap }) => $gap}px;
  margin-bottom: ${({ $gap }) => $gap}px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemWrapper = styled.div<{ $selected?: boolean; $dimmed?: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 3px solid ${({ $selected }) => ($selected ? '#0070f3' : 'transparent')};
  padding: 3px;
  cursor: pointer;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
  transition: opacity 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: #0070f3;
  }
`;

const CheckboxWrapper = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 0.25rem;
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;

  ${ItemWrapper}:hover & {
    opacity: 1;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const PdfBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
  color: #444;
`;

const LightboxButton = styled.button`
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 2;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;

  ${ItemWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
`;

/* ---------- Collage image with skeleton ---------------------------------- */

function CollageImage({
  src,
  alt,
  width,
  height,
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <>
      <SkeletonOverlay $visible={!loaded} />
      <Image
        src={src}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s ease-in',
        }}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

/* ------------------------------- Component -------------------------------- */

export default function GalleryCollage({
  items,
  selectedId,
  onSelect,
  selectable = false,
  checkedIds = [],
  onToggleCheck,
  dimmedWhen,
  gap = 6,
}: GalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<JustifiedRow[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const TARGET_ROW_HEIGHT = 200;
  const NARROW_BREAKPOINT = 366;

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    setContainerWidth(w);
    setRows(computeRows(items, w, TARGET_ROW_HEIGHT, gap));
  }, [items, gap]);

  useLayoutEffect(() => {
    recalculate();
    const ro = new ResizeObserver(() => recalculate());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalculate]);

  // Filter non-PDF items with sources for lightbox navigation
  const lightboxItems = items.filter(
    (item) => item.format !== 'pdf' && !!item.src
  );

  const openLightbox = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.format === 'pdf' || !item.src) return;
    const idx = lightboxItems.findIndex((li) => li.id === item.id);
    setLightboxIndex(idx >= 0 ? idx : null);
  };

  const lightboxItem =
    lightboxIndex !== null ? lightboxItems[lightboxIndex] : null;

  const handlePrev =
    lightboxIndex !== null && lightboxIndex > 0
      ? () => setLightboxIndex(lightboxIndex - 1)
      : undefined;

  const handleNext =
    lightboxIndex !== null && lightboxIndex < lightboxItems.length - 1
      ? () => setLightboxIndex(lightboxIndex + 1)
      : undefined;

  return (
    <>
      <Container ref={containerRef}>
        {containerWidth > 0 && containerWidth < NARROW_BREAKPOINT ? (
          /* Narrow mode: simple vertical stack */
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
            {items.map((item) => {
              const isPdf = item.format === 'pdf';
              const checked = checkedIds.includes(item.id);
              const dimmed = dimmedWhen ? dimmedWhen(item) : false;

              return (
                <ItemWrapper
                  key={item.id}
                  $selected={item.id === selectedId}
                  $dimmed={dimmed}
                  onClick={() => onSelect?.(item.id)}
                  style={{ width: '100%' }}
                >
                  {selectable && (
                    <CheckboxWrapper
                      $visible={checked}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCheck?.(item.id);
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={() => onToggleCheck?.(item.id)}
                        aria-label={`${item.label ?? item.id} auswählen`}
                      />
                    </CheckboxWrapper>
                  )}
                  {isPdf ? (
                    <PdfBadge>PDF: {item.label ?? item.id}</PdfBadge>
                  ) : item.src ? (
                    <>
                      <CollageImage
                        src={item.src}
                        alt={item.label ?? item.id}
                        width={item.width || 400}
                        height={item.height || 300}
                        style={{ objectFit: 'cover', display: 'block', width: '100%', height: 'auto' }}
                      />
                      <LightboxButton
                        onClick={(e) => openLightbox(item, e)}
                        aria-label={`${item.label ?? item.id} vergrößern`}
                        title="Bild vergrößern"
                      >
                        <Icon name="MdZoomIn" size={18} />
                      </LightboxButton>
                    </>
                  ) : (
                    <PdfBadge>Kein Bild</PdfBadge>
                  )}
                </ItemWrapper>
              );
            })}
          </div>
        ) : (
          /* Justified rows mode */
          rows.map((row, rowIdx) => (
            <Row key={rowIdx} $gap={gap}>
              {row.items.map((item) => {
                const ar = item.width && item.height ? item.width / item.height : 1;
                const itemWidth = ar * row.height;
                const isPdf = item.format === 'pdf';
                const checked = checkedIds.includes(item.id);
                const dimmed = dimmedWhen ? dimmedWhen(item) : false;

                const itemStyle: React.CSSProperties = row.isFull
                  ? { flexGrow: ar, flexBasis: 0, height: `${row.height}px` }
                  : { width: `${itemWidth}px`, height: `${row.height}px`, flexShrink: 0 };

                return (
                  <ItemWrapper
                    key={item.id}
                    $selected={item.id === selectedId}
                    $dimmed={dimmed}
                    onClick={() => onSelect?.(item.id)}
                    style={itemStyle}
                  >
                    {selectable && (
                      <CheckboxWrapper
                        $visible={checked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCheck?.(item.id);
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          onChange={() => onToggleCheck?.(item.id)}
                          aria-label={`${item.label ?? item.id} auswählen`}
                        />
                      </CheckboxWrapper>
                    )}

                    {isPdf ? (
                      <PdfBadge>PDF: {item.label ?? item.id}</PdfBadge>
                    ) : item.src ? (
                      <>
                        <CollageImage
                          src={item.src}
                          alt={item.label ?? item.id}
                          width={Math.round(itemWidth)}
                          height={Math.round(row.height)}
                          style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }}
                        />
                        <LightboxButton
                          onClick={(e) => openLightbox(item, e)}
                          aria-label={`${item.label ?? item.id} vergrößern`}
                          title="Bild vergrößern"
                        >
                          <Icon name="MdZoomIn" size={18} />
                        </LightboxButton>
                      </>
                    ) : (
                      <PdfBadge>Kein Bild</PdfBadge>
                    )}
                  </ItemWrapper>
                );
              })}
            </Row>
          ))
        )}
      </Container>

      {lightboxItem && lightboxItem.src && (
        <Lightbox
          src={lightboxItem.src}
          alt={lightboxItem.label ?? lightboxItem.id}
          caption={lightboxItem.label}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          onEdit={() => {
            onSelect?.(lightboxItem.id);
            setLightboxIndex(null);
          }}
        />
      )}
    </>
  );
}

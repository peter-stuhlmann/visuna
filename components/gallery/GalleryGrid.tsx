'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import type { GalleryItem, GalleryProps } from './types';
import Lightbox from './Lightbox';
import { Icon } from '@/components/content-elements/default';
import SkeletonImage from './SkeletonImage';

/* --------------------------------- Styles --------------------------------- */

const Grid = styled.div<{ $gap: number }>`
  display: grid;
  gap: ${({ $gap }) => $gap}px;
  grid-template-columns: repeat(4, 1fr);
  container-type: inline-size;

  @container (min-width: 1920px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @container (min-width: 1660px) and (max-width: 1919px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @container (max-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @container (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @container (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const Item = styled.div<{ $selected?: boolean; $dimmed?: boolean }>`
  border-radius: 0.5rem;
  background: #fff;
  border: 3px solid ${({ $selected }) => ($selected ? '#0070f3' : 'transparent')};
  padding: 3px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #777;
  cursor: pointer;
  position: relative;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
  transition: opacity 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: #0070f3;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 0.25rem;
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

  ${Item}:hover & {
    opacity: 1;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const PdfBadge = styled.div`
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

  ${Item}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
`;

/* ------------------------------- Component -------------------------------- */

export default function GalleryGrid({
  items,
  selectedId,
  onSelect,
  selectable = false,
  checkedIds = [],
  onToggleCheck,
  dimmedWhen,
  gap = 16,
}: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      <Grid $gap={gap}>
        {items.map((item) => {
          const isPdf = item.format === 'pdf';
          const checked = checkedIds.includes(item.id);
          const dimmed = dimmedWhen ? dimmedWhen(item) : false;

          return (
            <Item
              key={item.id}
              $selected={item.id === selectedId}
              $dimmed={dimmed}
              onClick={() => onSelect?.(item.id)}
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
                  <SkeletonImage
                    src={item.src}
                    alt={item.label ?? item.id}
                    loading="lazy"
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
                <span>Kein Bild</span>
              )}
            </Item>
          );
        })}
      </Grid>

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

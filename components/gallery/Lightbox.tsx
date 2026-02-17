'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

/* --------------------------------- Types ---------------------------------- */

export type LightboxProps = {
  /** Image URL to display */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional caption shown at the bottom */
  caption?: string;
  /** Called when lightbox should close */
  onClose: () => void;
  /** Called to go to the previous image (if available) */
  onPrev?: () => void;
  /** Called to go to the next image (if available) */
  onNext?: () => void;
  /** Called to edit the current image (closes lightbox & opens metadata) */
  onEdit?: () => void;
};

/* ----------------------------- Cloudinary Opt ----------------------------- */

/**
 * Optimize a Cloudinary URL for lightbox display by injecting
 * transformations (w_1600, q_auto, f_auto) after `/upload/`.
 * Non-Cloudinary URLs pass through unchanged.
 */
function optimizeCloudinaryUrl(url: string): string {
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  return (
    url.slice(0, idx + marker.length) +
    'w_1600,q_auto,f_auto/' +
    url.slice(idx + marker.length)
  );
}

/* --------------------------------- Styles --------------------------------- */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  animation: lbFadeIn 0.15s ease;

  @keyframes lbFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Content = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img<{ $loaded: boolean }>`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.25s ease;
`;

const TopActions = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 100000;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.3);
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const ArrowButton = styled.button<{ $side: 'left' | 'right' }>`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === 'left' ? 'left: 1rem;' : 'right: 1rem;')}
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 1.8rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  transition: background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.3);
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const Caption = styled.p`
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  margin: 0;
  max-width: 80vw;
  text-align: center;
  z-index: 100000;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  position: absolute;
`;

/* ------------------------------- Component -------------------------------- */

export default function Lightbox({ src, alt, caption, onClose, onPrev, onNext, onEdit }: LightboxProps) {
  const [loaded, setLoaded] = useState(false);
  const optimizedSrc = optimizeCloudinaryUrl(src);

  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // Close on Escape, arrow keys for prev/next
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const onPrevRef = React.useRef(onPrev);
  onPrevRef.current = onPrev;
  const onNextRef = React.useRef(onNext);
  onNextRef.current = onNext;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'ArrowLeft' && onPrevRef.current) onPrevRef.current();
      if (e.key === 'ArrowRight' && onNextRef.current) onNextRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch swipe support
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    const MIN_SWIPE = 50;
    if (diff > MIN_SWIPE && onPrev) onPrev();
    else if (diff < -MIN_SWIPE && onNext) onNext();
    touchStartX.current = null;
  };

  return (
    <Overlay
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Bildvorschau: ${alt}`}
    >
      <TopActions>
        {onEdit && (
          <ActionButton
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label="Bild bearbeiten"
            title="Metadaten bearbeiten"
          >
            ✎
          </ActionButton>
        )}
        <ActionButton
          onClick={onClose}
          aria-label="Lightbox schließen"
          autoFocus
        >
          ✕
        </ActionButton>
      </TopActions>

      {onPrev && (
        <ArrowButton
          $side="left"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Vorheriges Bild"
        >
          ‹
        </ArrowButton>
      )}

      {onNext && (
        <ArrowButton
          $side="right"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Nächstes Bild"
        >
          ›
        </ArrowButton>
      )}

      <Content onClick={(e) => e.stopPropagation()}>
        {!loaded && <Spinner role="status" aria-label="Bild wird geladen" />}
        <StyledImage
          src={optimizedSrc}
          alt={alt}
          $loaded={loaded}
          onLoad={() => setLoaded(true)}
        />
      </Content>

      {caption && <Caption>{caption}</Caption>}
    </Overlay>
  );
}

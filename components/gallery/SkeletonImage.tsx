'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

/* ----------------------------- Skeleton pulse ----------------------------- */

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    90deg,
    #e8e8e8 25%,
    #f5f5f5 50%,
    #e8e8e8 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease-out;
  pointer-events: none;
  border-radius: inherit;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const FadeImg = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.25s ease-in;
`;

/* ----------------------------- Component ---------------------------------- */

type SkeletonImageProps = {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  /** Extra styles for the wrapper (e.g. explicit width/height from collage) */
  style?: React.CSSProperties;
  /** Extra className */
  className?: string;
};

/**
 * Renders an `<img>` with an animated skeleton shimmer that
 * disappears smoothly when the image finishes loading.
 */
export default function SkeletonImage({
  src,
  alt,
  loading = 'lazy',
  style,
  className,
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <ImageWrapper style={style} className={className}>
      <SkeletonOverlay $visible={!loaded} />
      <FadeImg
        src={src}
        alt={alt}
        loading={loading}
        $loaded={loaded}
        onLoad={() => setLoaded(true)}
      />
    </ImageWrapper>
  );
}

export { SkeletonOverlay };

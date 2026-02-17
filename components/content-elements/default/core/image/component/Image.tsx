// components/content-elements/core/image/Image.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import getElementClassName from '../../../utils/getElementClassName';
import NextImage from 'next/image';
import Skeleton from '../../skeleton';
import { ImageContainer } from './Image.styles';
import { ImageProps } from './Image.types';
import NoJsMessage from '../../../no-js-message';
import { mergedConfig } from '../../../default.config';

const Image: FC<ImageProps> = ({
  src,
  alt,
  width = 1500,
  height = 1000,
  copyright = '',
  caption = '',
  className = '',
}) => {
  // Lädt das Bild gerade?
  const [isLoading, setIsLoading] = useState<boolean>(!!src);
  // Laden fehlgeschlagen?
  const [hasError, setHasError] = useState<boolean>(false);

  // Wenn sich src ändert, Lade-/Fehlerstatus zurücksetzen
  useEffect(() => {
    setIsLoading(!!src);
    setHasError(false);
    
    // Safety timeout: Falls onLoad nicht feuert (z.B. cached bei Remount),
    // erzwingen wir nach 1.5s das 'Loaded' Event. 
    // Skeleton verschwindet dann.
    const t = setTimeout(() => {
        setIsLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [src]);
  const elementClassName = getElementClassName('unwrapped-image');

  const handleImageLoading = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error('Image: Failed to load image:', src);
    setIsLoading(false);
    setHasError(true);
  };

  // Nur rendern, wenn es eine src gibt und wir keinen Fehler hatten
  const showImage = !!src && !hasError;

  return (
    <ImageContainer
      className={`${elementClassName} ${className}`}
      $width={width}
      $height={height}
      $isLoading={isLoading && showImage}
    >
      <div>
        {showImage ? (
          <>
            {isLoading && <Skeleton $width={width} $height={height} />}
            <NextImage
              src={src}
              alt={alt || ''}
              width={width}
              height={height}
              onLoad={handleImageLoading}
              onError={handleImageError}
              draggable={false}
            />
            <NoJsMessage
              hideElement={`.${mergedConfig.classPrefix}-skeleton`}
            />
          </>
        ) : (
          // Wenn keine src oder Fehler → einfach leer
          <div
            style={{
              background: '#e3e3e3',
              aspectRatio: `${width} / ${height}`,
              borderRadius: '1rem',
            }}
          />
        )}
      </div>
      <div>
        {caption}
        {copyright && caption && <> &ndash; </>}
        <i>{copyright}</i>
      </div>
    </ImageContainer>
  );
};

export default Image;

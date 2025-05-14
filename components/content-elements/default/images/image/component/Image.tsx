'use client';

import { FC, useState } from 'react';
import getElementClassName from '../../../utils/getElementClassName';
import NextImage from 'next/image';
import Skeleton from '../../../loading/skeleton';
import { ImageContainer } from './Image.styles';
import { ImageProps } from './Image.types';
import NoJsMessage from '../../../loading/no-js-message';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const elementClassName = getElementClassName(`unwrapped-image`);

  const handleImageLoading = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error('Image: Failed to load image:', src);
  };

  return (
    <ImageContainer
      className={`${elementClassName} ${className}`}
      $width={width}
      $height={height}
      $isLoading={isLoading}
    >
      <div>
        <NextImage
          src={src}
          alt={alt || ''}
          width={width}
          height={height}
          onLoad={handleImageLoading}
          onError={handleImageError}
        />
        {isLoading && <Skeleton $width={width} $height={height} />}
        <NoJsMessage hideElement={`.${mergedConfig.classPrefix}-skeleton`} />
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

'use client';

import { FC, useEffect, useState } from 'react';
import { VideoContainer } from './Video.styles';
import { VideoProps } from './Video.types';
import { ScreenSizeOptions } from '../../../types';
import { screenSizeMap } from '../../../styles.config';
import getBestMatchingVideo from './getBestMatchingVideo';

type SizeProps = {
  width: number;
  height: number;
};

const videoSizeMap: Record<ScreenSizeOptions, SizeProps> = {
  s: { width: 650, height: 650 },
  m: { width: 720, height: 500 },
  l: { width: 1280, height: 550 },
  xl: { width: 1280, height: 600 },
  xxl: { width: 1280, height: 800 },
  '3xl': { width: 1280, height: 800 },
  '4xl': { width: 1280, height: 800 },
};

const Video: FC<VideoProps> = ({ videos, objectFit = 'contain' }) => {
  const [screen, setScreen] = useState<ScreenSizeOptions | null>(null);

  useEffect(() => {
    const getScreen = () => {
      const width = window.innerWidth;
      if (width <= screenSizeMap.s) setScreen('s');
      else if (width <= screenSizeMap.m) setScreen('m');
      else if (width <= screenSizeMap.l) setScreen('l');
      else if (width <= screenSizeMap.xl) setScreen('xl');
      else if (width <= screenSizeMap.xxl) setScreen('xxl');
      else if (width <= screenSizeMap['3xl']) setScreen('3xl');
      else setScreen('4xl');
    };

    getScreen();
    window.addEventListener('resize', getScreen);
    return () => window.removeEventListener('resize', getScreen);
  }, []);

  if (!screen) return null;

  const matchedVideo = getBestMatchingVideo(videos, screen);
  if (!matchedVideo) return null;

  const { width, height } = videoSizeMap[screen];
  const videoSrc = matchedVideo.src;

  return (
    <VideoContainer
      key={videoSrc}
      width={width}
      height={height}
      muted
      autoPlay
      playsInline
      $objectFit={objectFit}
    >
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </VideoContainer>
  );
};

export default Video;

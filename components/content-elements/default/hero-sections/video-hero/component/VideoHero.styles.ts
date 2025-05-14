'use client';

import styled from 'styled-components';
import { VideoHeroStyleProps } from './VideoHero.types';

export const VideoHeroContainer = styled.section<VideoHeroStyleProps>`
  display: flex;
  position: relative;
  height: 800px;

  @media (max-width: 1440px) {
    height: 600px;
  }

  @media (max-width: 1280px) {
    height: 550px;
  }

  @media (max-width: 768px) {
    height: 500px;
  }

  @media (max-width: 480px) {
    height: 650px;
  }

  video {
    width: 100%;
    height: 100%;
  }

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1;
    width: calc(100% - 2rem);
    max-width: 800px;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 1rem;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${({ $overlayColor }) => $overlayColor};
    opacity: ${({ $overlayOpacity }) => $overlayOpacity};
    z-index: 0;
  }
`;

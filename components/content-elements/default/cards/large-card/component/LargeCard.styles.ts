'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';
import { LargeCardStyleProps } from './LargeCard.types';

export const LargeCardContainer = styled.div<LargeCardStyleProps>`
  color: ${({ $textColor }) => $textColor};
  width: 100%;
  height: 500px;
  min-height: 500px;
  max-height: calc(100vh - 2rem);
  box-sizing: border-box;
  border-radius: 1rem;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  @media (max-width: 768px) {
    height: auto;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  & > div {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    padding: 1rem;
    box-sizing: border-box;
    background-color: ${({ $cardBackgroundColor }) => $cardBackgroundColor};
    box-shadow: rgba(0, 0, 0, 0.25) 0px 50px 120px -70px;
    transition: box-shadow 0.5s ease-in-out;
    position: relative;
    overflow: hidden;

    .overlay {
      background-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(0, 0, 0, 0.6) 25%,
        rgba(0, 0, 0, 0.4) 60%,
        rgba(0, 0, 0, 0) 100%
      );
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }

    .content {
      position: relative;
      z-index: 2000;
      max-height: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      & > div {
        max-height: 100%;

        &.highlighted-text {
          h2,
          h3,
          p,
          ul li {
            & > span {
              background-color: ${({ $highlightColor }) => $highlightColor};
              color: ${({ $textColor }) => $textColor};
              display: inline;
              padding: 0.5rem;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
            }
          }
          p {
            line-height: 1.8;
          }
          ul {
            gap: 0;

            li {
              & > span {
                display: flex;
              }
            }
          }
        }

        & > div {
          height: 100%;
          max-width: 600px;
          font-family: var(--primary-font), sans-serif;
          border-radius: 1rem;
          padding: 2rem;
          box-sizing: border-box;

          opacity: ${({ $isInViewport }) => ($isInViewport ? 1 : 0)};
          transform: translateX(
            ${({ $isInViewport }) => ($isInViewport ? '0' : '5rem')}
          );

          transition: ${({ $isInViewport }) =>
            $isInViewport
              ? 'transform 0.7s ease-in-out, opacity 1s ease-in-out'
              : 'transform 0.7s ease-in-out 0.4s, opacity 0.2s ease-in-out'};

          @media (max-width: 768px) {
            padding: 1rem;
          }

          h2,
          h3 {
            margin: 0 0 1rem 0;
            font-size: 2rem;
            line-height: 1.4;
            text-transform: uppercase;
            z-index: 2000;

            @media (max-width: 768px) {
              font-size: 1.5rem;
            }
          }

          p {
            font-size: 1rem;
            margin: 0;
          }
        }
      }
    }

    .cta-buttons {
      padding: 2rem;
      display: flex;
      flex-flow: row wrap;
      gap: 1rem;
      opacity: ${({ $isInViewport }) => ($isInViewport ? 1 : 0)};
      transform: translateX(
        ${({ $isInViewport }) => ($isInViewport ? '0' : '5rem')}
      );

      transition: ${({ $isInViewport }) =>
        $isInViewport
          ? 'transform 0.7s ease-in-out, opacity 1s ease-in-out'
          : 'transform 0.7s ease-in-out 0.4s, opacity 0.2s ease-in-out'};

      @media (max-width: 768px) {
        padding: 1rem;
        gap: 0.5rem;
      }
    }

    .background-video-play-button {
      z-index: 3000;
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      width: 48px;
      height: 48px;
      font-size: 13px;
      font-weight: normal;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      transition: background-color 0.2s ease-in-out;

      &:hover,
      &:focus-visible {
        background-color: rgba(0, 0, 0, 0.75);
      }
    }

    .video-container {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
      pointer-events: none;

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        will-change: opacity;
        opacity: 0;
        animation: fadeIn 0.5s ease-in-out forwards;
        animation-delay: 0.5s;

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      }
    }

    .${mergedConfig.classPrefix}-unwrapped-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
`;

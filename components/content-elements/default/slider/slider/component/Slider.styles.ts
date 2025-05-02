import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const SliderContainer = styled.div<{
  $totalSlides: number;
  $activeSlideIndex: number;
  $slideOffset: string;
}>`
  &.${mergedConfig.classPrefix}-slider-container {
    height: calc(800px + 48px + 2rem);
    margin: 0;
    position: relative;

    @media (max-width: 1440px) {
      height: calc(700px + 48px + 2rem);
    }

    @media (max-width: 1280px) {
      height: calc(600px + 48px + 1rem);
    }

    @media (max-width: 768px) {
      height: calc(700px + 48px + 1rem);
    }

    @media (max-width: 480px) {
      height: calc(500px + 48px + 1rem);
    }
  }

  .${mergedConfig.classPrefix}-slider-slides {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    @media (max-width: 1280px) {
      padding: 0.5rem 0;
    }

    @media (max-width: 480px) {
      padding: 0;
    }

    & > div {
      margin: 0 auto;
      height: 100%;
      width: calc(100% - 8rem);
      max-width: 1440px;
      position: relative;

      @media (max-width: 768px) {
        width: calc(100% - 4rem);
      }

      @media (max-width: 480px) {
        width: 100%;
      }
      & > div {
        display: flex;
        justify-content: center;
        margin: 0;
        padding: 0;
        height: 100%;
        width: calc(${({ $totalSlides }) => $totalSlides} * 100%);
        transition: transform 0.5s ease-in-out;
        transform: translateX(${({ $slideOffset }) => $slideOffset});

        & > .${mergedConfig.classPrefix}-slider-slide {
          flex: 0 0 calc(100% / ${({ $totalSlides }) => $totalSlides});
          /* height: 800px; */
          max-height: calc(100vh - 2rem);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          margin: 0;

          & > div {
            background-color: transparent;
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: relative;

            // & > SlideStyles
          }
        }
      }
    }
  }
`;

export const SliderControl = styled.div<{ $progress: number }>`
  position: sticky;
  bottom: 2rem;
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  margin-top: calc(-48px - 1.5rem);
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  user-select: none;
  padding: 0.5rem 0;

  &.is-visible {
    opacity: 1;
  }

  > div {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      gap: 0.5rem;
    }

    > div {
      background-color: rgba(0, 0, 0, 0.5);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      height: 48px;
      border-radius: 1000px;
      display: flex;
      justify-content: center;
      align-items: center;

      &:first-child {
        width: 48px;
      }
    }
  }

  .slide-animation-control-button {
    min-width: 48px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
      transition: background-color 0.2s ease-in-out;
    }

    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: -10px;
    }

    svg {
      fill: #fff;
      width: 1rem;
      height: 1rem;
    }
  }

  .dots {
    height: 48px;
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0 1rem;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dot-button {
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 1000px;
    min-width: 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    margin: 0;
    position: relative;
    transition: background-color 0.2s, width 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &:first-of-type {
      margin-left: 0;
    }
    &:last-of-type {
      margin-right: 0;
    }

    &:focus-visible {
      outline: 2px solid #fff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.is-active {
      width: calc(40px + 16px);

      & > .dot {
        width: 40px;

        & > .progress {
          background-color: rgb(255, 255, 255);
          height: 100%;
          border-radius: 1000px;
        }
      }
    }

    & > .dot {
      width: 0.5rem;
      height: 0.5rem;
      border: none;
      border-radius: 1000px;
      background-color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: 0.2s;
      overflow: hidden;
    }
  }
`;

export const SlideContainer = styled.div<{
  $isInViewport: boolean;
  $outline?: 'light' | 'dark';
  $isActive?: boolean;
}>`
  color: #fff;
  width: 100%;
  height: 800px;
  max-height: calc(100vh - 2rem);
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 2rem;
  position: relative;
  top: 0rem;
  left: 0rem;
  right: 0rem;
  bottom: 0rem;
  z-index: 5000;

  &:focus-visible {
    outline: 0.25rem solid
      ${({ $outline }) => ($outline === 'light' ? '#fff' : '#000')};
    outline-offset: -1rem;
  }

  @media (max-width: 1440px) {
    height: 700px;
  }

  @media (max-width: 1280px) {
    width: calc(100% - 1rem);
    height: calc(100% - 48px - 1rem);
    padding: 0.5rem;
    border-radius: 1.5rem;

    &:focus-visible {
      outline-offset: -0.5rem;
    }
  }

  @media (max-width: 768px) {
    &:focus-visible {
      outline-offset: -0.5rem;
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 2rem;

    &:focus-visible {
      outline-offset: -1rem;
    }
  }

  & > div {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    box-shadow: ${({ $isActive = false, $outline = 'light' }) =>
      $isActive
        ? $outline === 'light'
          ? 'rgba(0, 0, 0, 1) 0px 50px 120px -70px'
          : 'rgba(0, 0, 0, 0.5) 0px 50px 100px -20px,rgba(0, 0, 0, 0.3) 0px 30px 60px -30px'
        : '0px 0px 0.5rem 0px rgba(0, 0, 0, 0.25)'};
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
      border-radius: 1.5rem;

      &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: -1rem;
      }

      @media (max-width: 768px) {
        border-radius: 1rem;

        &:focus-visible {
          outline-offset: -0.5rem;
        }
      }

      & > div {
        max-height: 100%;

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

          h3 {
            font-size: 2rem;
            margin: 0 0 1rem 0;

            @media (max-width: 768px) {
              font-size: 1.5rem;
            }
          }

          p {
            font-size: 1rem;
            line-height: 1.3;
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
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

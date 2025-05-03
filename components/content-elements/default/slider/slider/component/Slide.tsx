'use client';

import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import useIsInViewport from '../../../utils/useIsInViewport';
import getElementClassName from '../../../utils/getElementClassName';
import { SlideContainer } from './Slider.styles';
import Image from 'next/image';
import { getPrimaryColor } from '../../../constants';
import { SlideContent, VideoStatus } from './Slider.types';
import Button, { ButtonProps } from '../../../button/button';

const Slide: FC<{
  id: string;
  children: SlideContent;
  setActiveSlideIndex: (index: number, manual?: boolean) => void;
  activeSlideIndex: number;
  slideIndex: number;
  totalSlides: number;
  backgroundColor?: string | null;
  backgroundImage?: { src: string; alt: string } | null;
  backgroundVideo?: { src: string; type: string } | null;
  videoStatus: VideoStatus;
  setIsSlideChangePlaying: (isSlideChangePlaying: boolean) => void;
  setVideoStatus: (videoStatus: VideoStatus) => void;
  ctaButton: ButtonProps[];
  $outline: 'light' | 'dark';
  $textColor?: string | null;
  overlay?: 'none' | 'dark-gradient';
  isHighlighted?: boolean;
  $highlightedTextBackgroundColor?: string | null;
}> = ({
  id,
  children,
  setActiveSlideIndex,
  activeSlideIndex,
  slideIndex,
  totalSlides,
  backgroundColor,
  backgroundImage,
  backgroundVideo,
  videoStatus,
  setIsSlideChangePlaying,
  setVideoStatus,
  ctaButton,
  $outline,
  $textColor,
  overlay = 'none',
  isHighlighted = false,
  $highlightedTextBackgroundColor,
}) => {
  const slideRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isInViewport = useIsInViewport(slideRef, 0.5);
  const [isSlideActive, setIsSlideActive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeSlideIndex === slideIndex && isInViewport) {
      if (videoStatus.isPlaying) {
        setVideoStatus({
          status: 1,
          isPlaying: true,
          isEnded: false,
          buttonLabel: 'Pause',
        });
        video.play().catch(console.warn);
      } else {
        setVideoStatus({
          status: 0,
          isPlaying: false,
          isEnded: false,
          buttonLabel: 'Play',
        });
        video.pause();
      }
    } else {
      video.pause();
    }
  }, [videoStatus.isPlaying, activeSlideIndex, slideIndex, isInViewport]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () =>
      setVideoStatus({
        status: 0,
        isPlaying: true,
        isEnded: true,
        buttonLabel: 'Reset',
      });
    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [setVideoStatus, videoStatus]);

  const handleTogglePlay = (oldStatus: 0 | 1 | -1) => {
    const video = videoRef.current;
    if (!video) return;

    switch (oldStatus) {
      case 0:
        video.play().catch(console.warn);
        setVideoStatus({
          status: 1,
          isPlaying: true,
          isEnded: false,
          buttonLabel: 'Pause',
        });
        break;
      case 1:
        video.pause();
        setIsSlideChangePlaying(false);
        setVideoStatus({
          status: 0,
          isPlaying: false,
          isEnded: false,
          buttonLabel: 'Play',
        });
        break;
      case -1:
        video.currentTime = 0;
        video.play().catch(console.warn);
        setVideoStatus({
          status: 1,
          isPlaying: true,
          isEnded: false,
          buttonLabel: 'Pause',
        });
        break;
    }
  };

  const handleSlideKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsSlideActive(true);
    } else if (e.key === 'Escape') {
      setIsSlideActive(false);
    } else if (e.key === 'ArrowRight') {
      setIsSlideActive(false);
      setActiveSlideIndex((activeSlideIndex + 1) % totalSlides, true);
    } else if (e.key === 'ArrowLeft') {
      setIsSlideActive(false);
      setActiveSlideIndex(
        (activeSlideIndex - 1 + totalSlides) % totalSlides,
        true
      );
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSlideActive && isInViewport && buttonRef.current) {
        buttonRef.current.focus();
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isSlideActive, isInViewport]);

  const elementClassName = getElementClassName('slide');

  return (
    <SlideContainer
      id={id}
      className={`${elementClassName} ${elementClassName}-${slideIndex + 1}`}
      tabIndex={slideIndex === activeSlideIndex ? 0 : -1}
      onKeyDown={
        slideIndex === activeSlideIndex ? handleSlideKeyDown : undefined
      }
      aria-label={`Folie ${slideIndex + 1} von ${totalSlides}`}
      $isInViewport={isInViewport}
      $isActive={slideIndex === activeSlideIndex}
      $outline={$outline}
      $textColor={$textColor || getPrimaryColor()['950']}
      $highlightedTextBackgroundColor={
        $highlightedTextBackgroundColor || getPrimaryColor()['200']
      }
    >
      <div
        ref={slideRef}
        style={{ backgroundColor: backgroundColor || 'transparent' }}
      >
        {backgroundVideo && (
          <>
            <div className="video-container">
              <video ref={videoRef} muted playsInline aria-hidden="true">
                <source
                  src={backgroundVideo.src}
                  type={backgroundVideo.type || 'video/mp4'}
                />
              </video>
            </div>

            {isInViewport && (
              <Button
                ref={buttonRef}
                variant="text"
                className={`background-video-play-button ${
                  videoStatus.isPlaying ? 'is-playing' : ''
                }`}
                onClick={() =>
                  handleTogglePlay(
                    videoStatus.isEnded ? -1 : videoStatus.isPlaying ? 1 : 0
                  )
                }
                tabIndex={isSlideActive ? 0 : -1}
              >
                {videoStatus.buttonLabel}
              </Button>
            )}
          </>
        )}
        {overlay && overlay === 'dark-gradient' && <div className="overlay" />}
        <div className="content">
          <div className={isHighlighted ? 'highlighted-text' : 'text'}>
            {children}
          </div>
          {ctaButton.length > 0 && (
            <div className="cta-buttons">
              {ctaButton.map((button: ButtonProps, idx: number) => (
                <Button
                  key={idx}
                  variant={button.variant}
                  $textColor={button.$textColor}
                  primaryColor={button.primaryColor}
                  tabIndex={isSlideActive ? 0 : -1}
                >
                  {button.children}
                </Button>
              ))}
            </div>
          )}
        </div>
        {backgroundImage && (
          <Image src={backgroundImage.src} alt={backgroundImage.alt} fill />
        )}
      </div>
    </SlideContainer>
  );
};

export default Slide;

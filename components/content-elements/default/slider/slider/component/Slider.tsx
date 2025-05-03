'use client';

import React, { FC, useRef, useState, useEffect, useCallback } from 'react';

import { Slide as SlideProps, SliderProps, VideoStatus } from './Slider.types';
import SliderControlMenu from './SliderControlMenu';
import useIsInViewport from '../../../utils/useIsInViewport';
import { SliderContainer } from './Slider.styles';
import Wrapper from '../../../layout/wrapper';
import getElementClassName from '../../../utils/getElementClassName';
import Slide from './Slide';
import { useDrag } from '@use-gesture/react';
import NoJsMessage from '../../../loading/no-js-message';

const Slider: FC<SliderProps> = ({
  id = 'slider-1',
  isLooping = false,
  slideDuration = 7000,
  slides = [],
  className = '',
  $backgroundColor,
  $outline = 'dark',
  slideAnimationDefaultPlay = true,
}) => {
  const elementClassName = getElementClassName('slider');

  const [activeSlideIndex, setActiveSlideIndexState] = useState<number>(0);
  const [isManualChange, setIsManualChange] = useState<boolean>(false);

  const bind = useDrag(
    ({ movement: [mx], last }) => {
      if (last) {
        const threshold = 50;

        if (mx > threshold) {
          const newIndex = (activeSlideIndex - 1 + totalSlides) % totalSlides;
          setActiveSlideIndex(newIndex, true);
        } else if (mx < -threshold) {
          const newIndex = (activeSlideIndex + 1) % totalSlides;
          setActiveSlideIndex(newIndex, true);
        }
      }
    },
    { axis: 'x', filterTaps: true }
  );

  const [videoStatus, setVideoStatus] = useState<VideoStatus>(
    slideAnimationDefaultPlay
      ? {
          status: 1,
          isPlaying: true,
          isEnded: false,
          buttonLabel: 'Pause',
        }
      : {
          status: 0,
          isPlaying: false,
          isEnded: false,
          buttonLabel: 'Play',
        }
  );
  const [isSlideChangePlaying, setIsSlideChangePlaying] = useState<boolean>(
    slideAnimationDefaultPlay
  );

  const totalSlides = slides.length;

  const elementRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(elementRef, 0.45);

  const setActiveSlideIndex = useCallback(
    (index: number, manual: boolean = false) => {
      setActiveSlideIndexState(index);
      setIsManualChange(manual);
    },
    []
  );

  useEffect(() => {
    if (isManualChange) {
      const slideElement = document.getElementById(
        `${id}-slide-${activeSlideIndex}`
      );
      if (slideElement) {
        (slideElement as HTMLElement).focus({ preventScroll: false });
      }
      setIsManualChange(false);
    }
  }, [activeSlideIndex, isManualChange]);

  return (
    <>
      <Wrapper
        width="large"
        innerWidth="large"
        padding="none"
        backgroundColor={$backgroundColor}
        className={`${elementClassName} ${className}`}
        ref={elementRef}
        id={id}
      >
        <SliderContainer
          className={`${elementClassName}-container`}
          $totalSlides={totalSlides}
          $activeSlideIndex={activeSlideIndex}
          $slideOffset={`-${activeSlideIndex * (100 / totalSlides)}%`}
        >
          <div className={`${elementClassName}-slides`} {...bind()}>
            <div>
              <div>
                {slides.map((slide: SlideProps, idx: number) => {
                  return (
                    <Slide
                      key={idx}
                      id={`${id}-slide-${idx}`}
                      slideIndex={idx}
                      setActiveSlideIndex={setActiveSlideIndex}
                      activeSlideIndex={activeSlideIndex}
                      totalSlides={totalSlides}
                      backgroundColor={slide.backgroundColor ?? null}
                      backgroundVideo={slide.backgroundVideo ?? null}
                      backgroundImage={slide.backgroundImage ?? null}
                      overlay={slide.overlay ?? 'none'}
                      videoStatus={videoStatus}
                      setIsSlideChangePlaying={setIsSlideChangePlaying}
                      setVideoStatus={setVideoStatus}
                      ctaButton={slide.ctaButton ?? []}
                      $outline={$outline}
                      $textColor={slide.$textColor ?? null}
                      isHighlighted={slide.isHighlighted ?? false}
                      $highlightedTextBackgroundColor={
                        slide.$highlightedTextBackgroundColor ?? null
                      }
                    >
                      {slide.content}
                    </Slide>
                  );
                })}
              </div>
            </div>
          </div>
          <SliderControlMenu
            slides={slides}
            isInViewport={isInViewport}
            isLooping={isLooping}
            slideDuration={slideDuration}
            totalSlides={totalSlides}
            activeSlideIndex={activeSlideIndex}
            setActiveSlideIndex={setActiveSlideIndex}
            isSlideChangePlaying={isSlideChangePlaying}
            setIsSlideChangePlaying={setIsSlideChangePlaying}
          />
        </SliderContainer>
      </Wrapper>
      <NoJsMessage className={elementClassName} />
    </>
  );
};

export default Slider;

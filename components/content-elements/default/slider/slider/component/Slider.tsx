'use client';

import React, { FC, useRef, useState, useEffect, useCallback } from 'react';

import { SlideProps, SliderProps, VideoStatus } from './Slider.types';
import SliderControlMenu from './SliderControlMenu';
import useIsInViewport from '../../../utils/useIsInViewport';
import { SliderContainer } from './Slider.styles';
import Slide from './Slide';
import { useDrag } from '@use-gesture/react';
import NoJsMessage from '../../../loading/no-js-message';

const Slider: FC<SliderProps> = ({
  isLooping = false,
  slideDuration = 7000,
  slides = [],
  $outline = 'dark',
  slideAnimationDefaultPlay = true,
  className,
}) => {
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
        `${className}-slide-${activeSlideIndex}`
      );
      if (slideElement) {
        (slideElement as HTMLElement).focus({ preventScroll: false });
      }
      setIsManualChange(false);
    }
  }, [activeSlideIndex, isManualChange, className]);

  return (
    <>
      <SliderContainer
        ref={elementRef}
        className={`${className}-container`}
        $totalSlides={totalSlides}
        $activeSlideIndex={activeSlideIndex}
        $slideOffset={`-${activeSlideIndex * (100 / totalSlides)}%`}
      >
        <div className={`${className}-slides`} {...bind()}>
          <div>
            <div>
              {slides.map((slide: SlideProps, idx: number) => {
                return (
                  <Slide
                    key={idx}
                    id={`${className}-slide-${idx}`}
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
          isSlideChangePlaying={isSlideChangePlaying && isInViewport}
          setIsSlideChangePlaying={setIsSlideChangePlaying}
        />
      </SliderContainer>
      <NoJsMessage hideElement={`.${className} .${className}-wrapper`} />
    </>
  );
};

export default Slider;

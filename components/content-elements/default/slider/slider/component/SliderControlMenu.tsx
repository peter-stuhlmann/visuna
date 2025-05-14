'use client';

import { useEffect, useState, FC, useRef, useLayoutEffect } from 'react';
import { RotateIcon, PauseIcon, PlayIcon } from '../../../icons';
import { SliderControlMenuProps } from './Slider.types';
import { SliderControl } from './Slider.styles';
import Button from '../../../button/button';
import getElementClassName from '../../../utils/getElementClassName';

const SliderControlMenu: FC<SliderControlMenuProps> = ({
  isInViewport,
  isLooping,
  slideDuration,
  slides,
  totalSlides,
  activeSlideIndex,
  setActiveSlideIndex,
  isSlideChangePlaying,
  setIsSlideChangePlaying,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isReset, setIsReset] = useState<boolean>(false);

  const intervalTime = 50;
  const [nextSlideIndex, setNextSlideIndex] = useState<number | null>(null);

  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const elementClassName = getElementClassName('slider-control-menu');

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isSlideChangePlaying && !isReset) {
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          const nextProgress =
            prevProgress + (intervalTime * 100) / slideDuration;

          if (nextProgress >= 100) {
            if (activeSlideIndex + 1 >= totalSlides && !isLooping) {
              setIsSlideChangePlaying(false);
              setIsReset(true);
              return 100;
            } else {
              setNextSlideIndex((activeSlideIndex + 1) % totalSlides);
              return 0;
            }
          }

          return nextProgress;
        });
      }, intervalTime);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isSlideChangePlaying,
    isReset,
    activeSlideIndex,
    isLooping,
    slideDuration,
    totalSlides,
    setIsSlideChangePlaying,
  ]);

  useLayoutEffect(() => {
    if (nextSlideIndex !== null) {
      setActiveSlideIndex(nextSlideIndex);
      setNextSlideIndex(null);
    }
  }, [nextSlideIndex, setActiveSlideIndex]);

  const lastInputWasKeyboard = useRef(false);

  useEffect(() => {
    const handleKeyDown = () => {
      lastInputWasKeyboard.current = true;
    };
    const handleMouseDown = () => {
      lastInputWasKeyboard.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const focusedElement = e.target as HTMLElement;
      if (!focusedElement) return;

      if (
        lastInputWasKeyboard.current &&
        focusedElement.closest('.psui-slide')
      ) {
        setIsSlideChangePlaying(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [setIsSlideChangePlaying]);

  const togglePlayPause = () => {
    if (isReset) {
      resetSlider();
    } else {
      setIsSlideChangePlaying(!isSlideChangePlaying);
    }
  };

  const resetSlider = () => {
    setActiveSlideIndex(0);
    setProgress(0);
    setIsSlideChangePlaying(true);
    setIsReset(false);
  };

  const jumpToSlide = (index: number) => {
    setActiveSlideIndex(index);
    setProgress(0);
    setIsReset(false);
  };

  const handleDotKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (idx + 1) % totalSlides;
      jumpToSlide(nextIndex);
      dotRefs.current[nextIndex]?.focus();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (idx - 1 + totalSlides) % totalSlides;
      jumpToSlide(prevIndex);
      dotRefs.current[prevIndex]?.focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      jumpToSlide(idx);
    }
  };

  return (
    <SliderControl
      $progress={progress}
      className={`${elementClassName} ${isInViewport ? 'is-visible' : ''}`}
    >
      <div>
        <div>
          <Button
            variant="text"
            className="slide-animation-control-button"
            onClick={togglePlayPause}
            ariaLabel={
              isReset
                ? 'Slider-Animation von Slide 1 neu starten'
                : isSlideChangePlaying
                ? 'Automatischen Slide-Wechsel pausieren'
                : 'Automatischen Slide-Wechsel fortsetzen'
            }
          >
            {isReset ? (
              <RotateIcon width="1rem" aria-hidden="true" />
            ) : isSlideChangePlaying ? (
              <PauseIcon width="0.9rem" aria-hidden="true" />
            ) : (
              <PlayIcon width="1rem" aria-hidden="true" />
            )}
          </Button>
        </div>
        <div>
          <div className="dots">
            {slides.map((_, idx: number) => (
              <button
                key={idx}
                ref={(el) => {
                  dotRefs.current[idx] = el;
                }}
                className={`dot-button ${
                  idx === activeSlideIndex ? 'is-active' : ''
                }`}
                onClick={() => jumpToSlide(idx)}
                tabIndex={idx === activeSlideIndex ? 0 : -1}
                onKeyDown={(e) => handleDotKeyDown(e, idx)}
                aria-label={`Gehe zu Folie ${idx + 1}`}
                aria-current={idx === activeSlideIndex ? 'true' : undefined}
              >
                <div className="dot">
                  {idx === activeSlideIndex && (
                    <div
                      className="progress"
                      style={{ width: progress + '%' }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SliderControl>
  );
};

export default SliderControlMenu;

import React, { useEffect, useState, FC, ReactElement } from 'react';
import { RotateIcon, PauseIcon, PlayIcon } from '../../../icons';
import { SliderControlMenuProps } from './Slider.types';
import { SliderControl } from './Slider.styles';
import Button from '../../../button/button';

const SliderControlMenu: FC<SliderControlMenuProps> = ({
  isInViewport,
  isLooping,
  slideDuration,
  slides,
  totalSlides,
  activeSlideIndex,
  setActiveSlideIndex,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isReset, setIsReset] = useState<boolean>(false);

  const intervalTime = 50; // Intervallzeit in Millisekunden

  const [nextSlideIndex, setNextSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPlaying && !isReset) {
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          const nextProgress =
            prevProgress + (intervalTime * 100) / slideDuration;

          if (nextProgress >= 100) {
            if (activeSlideIndex + 1 >= totalSlides && !isLooping) {
              setIsPlaying(false);
              setIsReset(true);
              return 100;
            } else {
              setNextSlideIndex((activeSlideIndex + 1) % totalSlides); // ✅ NEU
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
    isPlaying,
    isReset,
    activeSlideIndex,
    isLooping,
    slideDuration,
    totalSlides,
  ]);

  // ✅ Neuer Effekt
  useEffect(() => {
    if (nextSlideIndex !== null) {
      setActiveSlideIndex(nextSlideIndex);
      setNextSlideIndex(null);
    }
  }, [nextSlideIndex, setActiveSlideIndex]);

  const togglePlayPause = () => {
    if (isReset) {
      // Wenn die Animation zurückgesetzt wurde, von vorne starten
      resetSlider();
    } else {
      setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    }
  };

  const resetSlider = () => {
    setActiveSlideIndex(0);
    setProgress(0);
    setIsPlaying(true);
    setIsReset(false);
  };

  const jumpToSlide = (index: number) => {
    setActiveSlideIndex(index);
    setProgress(0);
    // setIsPlaying(true); // Dies entfernen, um den Play/Pause-Status beizubehalten
    setIsReset(false);
  };

  return (
    <SliderControl
      $progress={progress}
      className={`slider-control-menu ${isInViewport ? 'is-visible' : ''}`}
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
                : isPlaying
                ? 'Slider-Animation pausieren'
                : 'Slider-Animation fortsetzen'
            }
          >
            {isReset ? (
              <RotateIcon width="1rem" aria-hidden="true" />
            ) : isPlaying ? (
              <PauseIcon width="0.8rem" aria-hidden="true" />
            ) : (
              <PlayIcon width="0.8rem" aria-hidden="true" />
            )}
          </Button>
        </div>
        <div>
          <ul className="dots">
            {slides.map((slide, idx: number) => {
              const slideElement = slide as ReactElement<{
                'data-label'?: string;
              }>;
              const dataLabel = slideElement.props['data-label'];
              const ariaLabel = dataLabel
                ? `Gehe zu Slide ${idx + 1} - ${dataLabel}`
                : `Gehe zu Slide ${idx + 1}`;

              return (
                <li key={idx}>
                  <button
                    className={`dot ${
                      idx === activeSlideIndex ? 'is-active' : ''
                    }`}
                    onClick={() => jumpToSlide(idx)}
                    aria-label={ariaLabel}
                  >
                    <div>
                      {idx === activeSlideIndex && <div className="progress" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SliderControl>
  );
};

export default SliderControlMenu;

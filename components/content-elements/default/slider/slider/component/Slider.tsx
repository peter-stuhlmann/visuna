'use client';

import React, {
  Children,
  FC,
  isValidElement,
  ReactElement,
  useRef,
  useState,
  useEffect,
  cloneElement,
  useCallback,
} from 'react';

import { SliderProps } from './Slider.types';
import SliderControlMenu from './SliderControlMenu';
import useIsInViewport from '../../../utils/useIsInViewport';
import { SliderContainer } from './Slider.styles';
import Wrapper from '../../../layout/wrapper';
import Spacer from '../../../layout/spacer';

const Slider: FC<SliderProps> = ({
  isLooping = false,
  slideDuration = 7000,
  children,
  $backgroundColor,
}) => {
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type !== 'li') {
      throw new Error('Slider darf nur li-Elemente enthalten.');
    }
  });

  const [activeSlideIndex, setActiveSlideIndexState] = useState<number>(0);
  const [isManualChange, setIsManualChange] = useState<boolean>(false);

  const childrenArray = Children.toArray(children).filter(
    isValidElement
  ) as ReactElement[];
  const totalSlides = childrenArray.length;

  const elementRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(elementRef);

  const setActiveSlideIndex = useCallback(
    (index: number, manual: boolean = false) => {
      setActiveSlideIndexState(index);
      setIsManualChange(manual);
    },
    []
  );

  useEffect(() => {
    if (isManualChange) {
      const slideElement = document.getElementById(`slide-${activeSlideIndex}`);
      if (slideElement) {
        slideElement.focus();
      }
      setIsManualChange(false);
    }
  }, [activeSlideIndex, isManualChange]);

  return (
    <Wrapper
      width="large"
      innerWidth="large"
      padding="none"
      backgroundColor={$backgroundColor}
    >
      <Spacer $size="medium" />
      <SliderContainer
        id="slider"
        className="slider-container"
        $totalSlides={totalSlides}
        $activeSlideIndex={activeSlideIndex}
        $slideOffset={`-${activeSlideIndex * (100 / totalSlides)}%`}
      >
        <div ref={elementRef}>
          <div className="slide-list-wrapper">
            <div>
              <ul className="slides-list" aria-live="off">
                {childrenArray.map((child, idx: number) =>
                  cloneElement(
                    child as ReactElement<{ id?: string; tabIndex?: number }>,
                    {
                      key: idx,
                      id: `slide-${idx}`,
                      tabIndex: -1,
                    }
                  )
                )}
              </ul>
            </div>
          </div>
          <SliderControlMenu
            slides={childrenArray}
            isInViewport={isInViewport}
            isLooping={isLooping}
            slideDuration={slideDuration}
            totalSlides={totalSlides}
            activeSlideIndex={activeSlideIndex}
            setActiveSlideIndex={setActiveSlideIndex}
          />
        </div>
      </SliderContainer>
    </Wrapper>
  );
};

export default Slider;

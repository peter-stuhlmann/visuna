import { ReactElement, ReactNode } from 'react';

export type SliderProps = {
  children: ReactNode;
  isLooping?: boolean;
  slideDuration?: number;
  $backgroundColor?: string;
};

export type SliderControlMenuProps = {
  isInViewport: boolean;
  isLooping: boolean;
  slideDuration: number;
  slides: ReactElement[];
  totalSlides: number;
  activeSlideIndex: number;
  setActiveSlideIndex: (activeSlideIndex: number) => void;
};

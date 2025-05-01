import { ReactNode } from 'react';
import { ButtonProps } from '../../../button/button';

export type SliderProps = {
  id?: string;
  slides: Slide[];
  isLooping?: boolean;
  slideDuration?: number;
  className?: string;
  $backgroundColor?: string;
  $outline?: 'light' | 'dark';
  slideAnimationDefaultPlay?: boolean;
};

export type Slide = {
  content: SlideContent;
  backgroundColor?: string | null;
  backgroundImage?: {
    src: string;
    alt: string;
  } | null;
  backgroundVideo?: {
    src: string;
    type: string;
  } | null;
  ctaButton?: ButtonProps[];
};

export type SlideContent = ReactNode;

export type SliderControlMenuProps = {
  isInViewport: boolean;
  isLooping: boolean;
  slideDuration: number;
  slides: Slide[];
  totalSlides: number;
  activeSlideIndex: number;
  setActiveSlideIndex: (activeSlideIndex: number) => void;
  isSlideChangePlaying: boolean;
  setIsSlideChangePlaying: (isSlideChangePlaying: boolean) => void;
};

export type VideoStatus = {
  status: 1 | 0 | -1; // 1: playing, 0: paused, -1: ended
  isPlaying: boolean;
  isEnded: boolean;
  buttonLabel: 'Play' | 'Pause' | 'Reset';
};

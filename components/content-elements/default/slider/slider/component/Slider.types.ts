import { ReactNode } from 'react';
import { ButtonProps } from '../../../button/button';

export type SliderProps = {
  slides: SlideProps[];
  isLooping?: boolean;
  slideDuration?: number;
  $outline?: 'light' | 'dark';
  slideAnimationDefaultPlay?: boolean;
  className?: string;
};

export type SlideProps = {
  content: SlideContent;
  overlay?: 'none' | 'dark-gradient';
  isHighlighted?: boolean;
  $highlightedTextBackgroundColor?: string | null;
  $textColor?: string | null;
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
  slides: SlideProps[];
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

export type SliderStyleProps = {
  $totalSlides: number;
  $activeSlideIndex: number;
  $slideOffset: string;
};

import { ButtonProps } from '../../core/button';

export type LargeCardProps = {
  data?: LargeCardData;
};

export type LargeCardData = {
  children?: React.ReactNode;
  cardBackgroundColor?: string;
  textColor?: string;
  highlightColor?: string | null;
  backgroundImage?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  viewportTriggerOnce?: boolean;
  ctaButton?: ButtonProps[];
  overlay?: 'none' | 'dark-gradient';
};

export type LargeCardStyleProps = {
  $isInViewport: boolean;
  $isActive?: boolean;
  $cardBackgroundColor?: string;
  $textColor?: string;
  $highlightColor: string;
};

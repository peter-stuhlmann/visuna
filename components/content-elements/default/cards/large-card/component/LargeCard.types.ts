// import React from 'react';
// import { ButtonProps } from '../../../button/button';
import { LargeCardData } from '../../../types';

// export type LargeCardData = {
//   children?: React.ReactNode;
//   cardBackgroundColor?: string;
//   textColor?: string;
//   highlightColor?: string | null;
//   backgroundImage?: {
//     src: string;
//     alt: string;
//     width?: number;
//     height?: number;
//   };
//   viewportTriggerOnce?: boolean;
//   ctaButton?: ButtonProps[];
//   overlay?: 'none' | 'dark-gradient';
// };

export type LargeCardProps = {
  data?: LargeCardData;
};

export type LargeCardStyleProps = {
  $isInViewport: boolean;
  $isActive?: boolean;
  $cardBackgroundColor?: string;
  $textColor?: string;
  $highlightColor: string;
};

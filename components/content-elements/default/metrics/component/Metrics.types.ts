import { AnimationDuration } from '../../types';

export type MetricsProps = {
  data?: MetricsData;
};

export type MetricsData = {
  metrics: MetricsItemProps[];
};

export type MetricsItemProps = {
  id: string;
  label: string;
  animated: boolean;
  startValue?: number | null;
  endValue?: number | null;
  animationDuration?: AnimationDuration;
  prefix?: boolean;
  prefixText?: string;
  suffix?: boolean;
  suffixText?: string;
  isInViewport?: boolean;
};

import { WrapperProps } from '../../../layout/wrapper';

export type MetricsProps = {
  data: Metric[];
  textColor?: string;
  animated?: boolean;
  animationDuration?: number;
  animationOnce?: boolean;
  unwrapped?: boolean;
  // padding?: WrapperProps['padding'];
} & WrapperProps;

export type MetricItemProps = {
  label: number | string;
  value: number | string;
  isNumber: boolean;
  isInViewport: boolean;
  animated: boolean;
  animationDuration: number;
};

export type Metric = {
  label: string | number;
  value: string | number;
};

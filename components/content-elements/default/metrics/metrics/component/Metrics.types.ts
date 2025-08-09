export type Metric = {
  label: string;
  value: string | number;
};

export type MetricsProps = {
  metrics: Metric[];
  textColor?: string;
  animated?: boolean;
  animationDuration?: number;
  animationOnce?: boolean;
};

export type MetricItemProps = {
  label: number | string;
  value: number | string;
  isNumber: boolean;
  isInViewport: boolean;
  animated: boolean;
  animationDuration: number;
};

export type MetricsProps = {
  data: Metric[];
  $backgroundColor?: string;
  $textColor?: string;
  $margin?: 'none' | 'small' | 'medium' | 'large';
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

export type Metric = {
  label: string | number;
  value: string | number;
};

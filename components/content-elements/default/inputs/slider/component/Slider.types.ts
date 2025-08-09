export type SliderProps = {
  label?: string;
  start?: number;
  end?: number;
  steps?: number;
  current?: number;
  onChange?: (value: number) => void;
};

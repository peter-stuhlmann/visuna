export type RadioOptionItem = { label: string; value: string };

export type RadioInputProps = {
  label?: string;
  name?: string;
  value?: string;
  options: RadioOptionItem[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Vertical (default) oder "horizontal" */
  orientation?: 'vertical' | 'horizontal';
};

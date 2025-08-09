export type ColorInputProps = {
  label?: string;
  value: string;
  name?: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  backgroundColor?: string;
  throttleMs?: number;
};

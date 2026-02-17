// number-input types
export type NumberInputProps = {
  label?: string;
  value: number | null; // ⬅️ strikt: nur number oder null
  name?: string;
  onChange: (value: number | null) => void; // ⬅️ strikt: number oder null
  id?: string;
  backgroundColor?: string;
  status?: 'default' | 'error' | 'warning' | 'success';
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

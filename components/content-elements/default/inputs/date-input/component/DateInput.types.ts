export type DateInputProps = {
  label?: string;
  value?: string | null; // erwartetes Format: 'YYYY-MM-DD'
  onChange?: (value: string | '' | null) => void;
  name?: string;
  id?: string;

  backgroundColor?: string;
  status?: 'default' | 'error' | 'warning' | 'success';
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;

  /** HTML date-Attribute als ISO-Strings ('YYYY-MM-DD') */
  min?: string;
  max?: string;
};

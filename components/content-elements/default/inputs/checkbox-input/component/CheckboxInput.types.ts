export type CheckboxInputProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  /** Optional: visueller Zwischenzustand */
  indeterminate?: boolean;
};

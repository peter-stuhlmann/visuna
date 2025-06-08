export type SelectionControlsInputProps = {
  label?: string;
  checked?: boolean;
  color?: string;
  checkedColor?: string;
  onChange?: (checked: boolean) => void;
  type?: 'checkbox' | 'radio';
  id?: string;
  name?: string;
  ariaLabel?: string;
};

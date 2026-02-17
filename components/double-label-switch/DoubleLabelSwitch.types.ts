export type DoubleLabelSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
};

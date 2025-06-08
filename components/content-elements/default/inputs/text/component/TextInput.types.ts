import { Status } from '../../../types';

export type TextInputProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  id?: string;
  rows?: number;
  backgroundColor?: string;
  status?: Status;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  defaultValue?: string;
  autoFocus?: boolean;
};

import { ChangeEvent } from 'react';

export type CheckboxFieldProps = {
  name: string;
  error: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  checked: boolean;
  required: boolean;
  requiredMessage: string;
};

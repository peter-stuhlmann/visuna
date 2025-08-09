import { ChangeEvent } from 'react';

export type DateFieldProps = {
  name: string;
  error: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  value: string;
  required: boolean;
  requiredMessage: string;
};

import { ChangeEvent } from 'react';

export type SelectFieldProps = {
  name: string;
  error: boolean;
  handleChange: (e: ChangeEvent) => void;
  label: string;
  value: string;
  required: boolean;
  requiredMessage: string;
  options?: { label: Record<string, string>; value: string }[];
  language: string;
};

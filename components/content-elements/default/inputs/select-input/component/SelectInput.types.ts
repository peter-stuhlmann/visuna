import { ReactNode } from 'react';

export type SelectInputOption = {
  label: ReactNode;
  value: string;
  triggerLabel?: ReactNode;
};

export interface SelectInputProps {
  label?: string;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  backgroundColor?: string;
  status?: 'default' | 'error' | 'success';
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  options: SelectInputOption[];
  size?: 'small' | 'medium' | 'large';
}

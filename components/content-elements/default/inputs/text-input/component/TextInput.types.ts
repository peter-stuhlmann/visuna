import { KeyboardEvent, ReactNode } from 'react';
import { Status } from '../../../types';

export type TextInputProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;

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
  autoComplete?: string;
  end?: ReactNode;
};

export type SelectInputOption = {
  label: string;
  value: string;
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
}

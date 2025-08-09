'use client';

import { FC } from 'react';
import { TextInput } from '@/components/content-elements/default';

type InputProps = {
  type: string;
  onChange: (value: string) => void;
  value: string;
};

const Input: FC<InputProps> = ({ type, onChange, value }) => {
  let label: string = '';
  if (
    type === 'text' ||
    type === 'textarea' ||
    type === 'date' ||
    type === 'select' ||
    type === 'checkbox'
  ) {
    label = 'Input-Label';
  } else if (type === 'h2') {
    label = 'Überschrift';
  }

  return (
    <TextInput
      label={label}
      value={value}
      type={type}
      onChange={(value) => onChange(value)}
    />
  );
};

export default Input;

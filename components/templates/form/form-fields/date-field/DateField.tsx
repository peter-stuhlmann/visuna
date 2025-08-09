'use client';

import { FC } from 'react';
import { DateFieldProps } from './DateField.types';

const DateField: FC<DateFieldProps> = ({
  name,
  handleChange,
  value,
  required,
}) => {
  return (
    <input
      type="date"
      id={name}
      name={name}
      value={value}
      onChange={handleChange}
      required={required}
    />
  );
};

export default DateField;

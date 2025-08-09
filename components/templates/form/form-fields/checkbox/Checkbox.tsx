'use client';

import { FC } from 'react';
import { CheckboxFieldProps } from './Checkbox.types';
import { CheckboxWrapper, Label, Input, ErrorText } from './Checkbox.styles';

const CheckboxField: FC<CheckboxFieldProps> = ({
  name,
  error,
  handleChange,
  label,
  checked,
  required,
  requiredMessage,
}) => {
  return (
    <CheckboxWrapper $error={!!error}>
      <label>
        <Input
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={handleChange}
          required={required}
        />
        <Label>{label}</Label>
      </label>
      {error && <ErrorText>{requiredMessage}</ErrorText>}
    </CheckboxWrapper>
  );
};

export default CheckboxField;

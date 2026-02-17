'use client';

import React, { FC, useId, ChangeEvent } from 'react';
import { Container, GroupLabel, Textarea } from './HtmlInput.styles';

export type HtmlInputProps = {
  label?: string;
  name?: string;
  value: string;
  onChange?: (value: string) => void;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
};

const HtmlInput: FC<HtmlInputProps> = ({
  label,
  name,
  value,
  onChange,
  rows = 8,
  disabled = false,
  required = false,
  autoFocus = false,
  placeholder = '',
}) => {
  const id = useId();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <Container>
      {label ? <GroupLabel htmlFor={id}>{label}</GroupLabel> : null}
      <Textarea
        id={id}
        name={name}
        value={value ?? ''}
        onChange={handleChange}
        rows={rows}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </Container>
  );
};

export default HtmlInput;

'use client';

import React, { useId, useRef, ChangeEvent, FC } from 'react';
import { DateInputProps } from './DateInput.types';

// Styling 1:1 vom TextInput übernehmen
import { StyledInput, StyledLabel, Container } from './DateInput.styles';

const DateInput: FC<DateInputProps> = ({
  label,
  value,
  onChange,
  name,
  id,
  backgroundColor = '#fff',
  status = 'default',
  required = false,
  disabled = false,
  autoFocus = false,
  min,
  max,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // leer → '' zurückgeben (kompatibel mit deinem bisherigen Muster)
    onChange?.(v === '' ? '' : v);
  };

  const stringValue = value == null ? '' : String(value);

  return (
    <Container $backgroundColor={backgroundColor}>
      <StyledInput $status={status}>
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={stringValue}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          name={name}
          autoFocus={autoFocus}
          placeholder=""
          min={min}
          max={max}
        />
        {label && (
          <StyledLabel htmlFor={inputId} $backgroundColor={backgroundColor}>
            {label}
          </StyledLabel>
        )}
      </StyledInput>
    </Container>
  );
};

export default DateInput;

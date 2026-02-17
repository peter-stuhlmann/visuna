'use client';

import React, { useId, useRef, ChangeEvent, FC } from 'react';
import { NumberInputProps } from './NumberInput.types';
import { StyledInput, StyledLabel, Container } from './NumberInput.styles';

const NumberInput: FC<NumberInputProps> = ({
  label,
  value,
  name,
  onChange,
  id,
  backgroundColor = '#fff',
  status = 'default',
  required = false,
  disabled = false,
  autoFocus = false,
  min,
  max,
  step,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '') {
      onChange?.(null); // leer -> null nach außen
      return;
    }
    const n = Number(v);
    onChange?.(Number.isNaN(n) ? null : n);
  };

  // Für das native <input type="number"> braucht es einen String
  const stringValue = value == null ? '' : String(value);

  return (
    <Container $backgroundColor={backgroundColor}>
      <StyledInput $status={status}>
        <input
          ref={inputRef}
          id={inputId}
          type="number"
          value={stringValue}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          name={name}
          autoFocus={autoFocus}
          placeholder=""
          min={min}
          max={max}
          step={step}
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

export default NumberInput;

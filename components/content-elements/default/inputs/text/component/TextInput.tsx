'use client';

import React, { useId, useRef, ChangeEvent, FC } from 'react';

import { TextInputProps } from './TextInput.types';
import { StyledInput, StyledLabel, Container } from './TextInput.styles';

const TextInput: FC<TextInputProps> = ({
  label,
  value,
  name,
  onChange,
  type = 'text',
  id,
  rows = 1,
  backgroundColor = '#fff',
  status = 'default',
  required = false,
  disabled = false,
  autoFocus = false,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <Container $backgroundColor={backgroundColor}>
      <StyledInput $status={status}>
        {rows > 1 ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={inputId}
            value={value ?? ''}
            onChange={handleChange}
            rows={rows}
            required={required}
            disabled={disabled}
            name={name}
            autoFocus={autoFocus}
            placeholder=""
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={inputId}
            type={type}
            value={value ?? ''}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            name={name}
            autoFocus={autoFocus}
            placeholder=""
          />
        )}
        {label && (
          <StyledLabel htmlFor={inputId} $backgroundColor={backgroundColor}>
            {label}
          </StyledLabel>
        )}
      </StyledInput>
    </Container>
  );
};

export default TextInput;

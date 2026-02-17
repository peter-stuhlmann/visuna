'use client';

import React, { useId, useRef, ChangeEvent, FC, KeyboardEvent } from 'react';

import { TextInputProps } from './TextInput.types';
import { StyledInput, StyledLabel, Container } from './TextInput.styles';

const TextInput: FC<TextInputProps> = ({
  label,
  value,
  name,
  onChange,
  onKeyDown,
  type = 'text',
  id,
  rows = 1,
  backgroundColor = '#fff',
  status = 'default',
  required = false,
  disabled = false,
  autoFocus = false,
  autoComplete = 'on',
  end = null,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(e.target.value);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onKeyDown) onKeyDown(e);
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
            onKeyDown={handleKeyDown}
            rows={rows}
            required={required}
            disabled={disabled}
            name={name}
            autoFocus={autoFocus}
            placeholder=""
            autoComplete={autoComplete}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={inputId}
            type={type}
            value={value ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required={required}
            disabled={disabled}
            name={name}
            autoFocus={autoFocus}
            placeholder=""
            autoComplete={autoComplete}
          />
        )}

        {end && end}

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

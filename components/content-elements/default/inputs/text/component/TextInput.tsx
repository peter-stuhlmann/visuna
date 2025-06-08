'use client';

import React, { useId, useState, FocusEvent, ChangeEvent, FC } from 'react';

import { TextInputProps } from './TextInput.types';
import { StyledInput, StyledLabel, Wrapper } from './TextInput.styles';
import { getPrimaryColor } from '../../../constants';

const TextInput: FC<TextInputProps> = ({
  label,
  value,
  defaultValue,
  name,
  onChange,
  type = 'text',
  id,
  rows = 1,
  backgroundColor = getPrimaryColor()['50'],
  status = 'default',
  required = false,
  disabled = false,
  autoFocus = false,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [focused, setFocused] = useState<boolean>(autoFocus);

  const handleFocus = () => setFocused(true);

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.value === '') setFocused(false);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <Wrapper>
      <StyledInput $status={status}>
        {rows > 1 ? (
          <textarea
            id={inputId}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
            required={required}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            name={name}
            defaultValue={defaultValue}
            autoFocus={autoFocus}
          />
        )}
      </StyledInput>
      {label && (
        <StyledLabel
          htmlFor={inputId}
          $shrink={focused || !!value}
          $backgroundColor={backgroundColor}
        >
          {label}
        </StyledLabel>
      )}
    </Wrapper>
  );
};

export default TextInput;

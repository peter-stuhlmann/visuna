'use client';

import React, { FC, useEffect, useId, useRef } from 'react';
import {
  Container,
  CheckboxWrapper,
  HiddenCheckbox,
  Box,
  Checkmark,
  LabelText,
} from './CheckboxInput.styles';
import { CheckboxInputProps } from './CheckboxInput.types';

const CheckboxInput: FC<CheckboxInputProps> = ({
  label,
  checked = false,
  onChange,
  name,
  id,
  disabled = false,
  indeterminate = false,
}) => {
  const autoId = useId();
  const inputId = id || autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <Container>
      <CheckboxWrapper
        htmlFor={inputId}
        data-disabled={disabled ? 'true' : 'false'}
      >
        <HiddenCheckbox
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked}
        />

        <Box
          aria-hidden="true"
          data-checked={checked ? 'true' : 'false'}
          data-indeterminate={indeterminate ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
        >
          <Checkmark
            viewBox="0 0 20 20"
            data-checked={checked ? 'true' : 'false'}
            data-indeterminate={indeterminate ? 'true' : 'false'}
          >
            {/* Haken */}
            <path
              d="M5 10.5l3 3 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Indeterminate-Strich */}
            <rect
              x="4.5"
              y="9"
              width="11"
              height="2"
              rx="1"
              ry="1"
              fill="currentColor"
            />
          </Checkmark>
        </Box>

        {label ? <LabelText>{label}</LabelText> : null}
      </CheckboxWrapper>
    </Container>
  );
};

export default CheckboxInput;

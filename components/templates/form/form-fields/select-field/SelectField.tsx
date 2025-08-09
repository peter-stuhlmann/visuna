'use client';

import { FC } from 'react';
import { SelectFieldProps } from './SelectField.types';
// import {
//   FieldWrapper,
//   Label,
//   StyledSelect,
//   StyledOption,
//   ErrorText,
// } from './SelectField.styled';

const SelectField: FC<SelectFieldProps> = ({
  name,
  error,
  handleChange,
  label,
  value,
  required,
  requiredMessage,
  options,
  language,
}) => {
  return (
    <FieldWrapper $error={!!error}>
      <Label htmlFor={name}>
        {label}
        {required && ' *'}
      </Label>
      <StyledSelect
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        required={required}
      >
        <StyledOption value="" disabled>
          -- Bitte auswählen --
        </StyledOption>
        {options?.map((option, idx) => (
          <StyledOption key={option.value + idx} value={option.value}>
            {option.label[language]}
          </StyledOption>
        ))}
      </StyledSelect>
      {error && <ErrorText>{requiredMessage}</ErrorText>}
    </FieldWrapper>
  );
};

export default SelectField;

import styled from 'styled-components';

export const FieldWrapper = styled.div<{ $error: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0.5rem 0;
  color: ${({ $error }) => ($error ? '#d32f2f' : 'inherit')};
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
`;

export const StyledSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
`;

export const StyledOption = styled.option``;

export const ErrorText = styled.span`
  font-size: 0.8rem;
  color: #d32f2f;
`;

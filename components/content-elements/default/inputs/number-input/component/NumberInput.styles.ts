import styled from 'styled-components';
import { statusColorsMap } from '../../../styles.config';

export const Container = styled.div<{ $backgroundColor: string }>`
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding-top: 10px;
  width: 100%;
`;

export const StyledInput = styled.div<{
  $status: 'default' | 'error' | 'warning' | 'success';
}>`
  border: 1px solid ${({ $status }) => statusColorsMap[$status]};
  border-radius: 1rem;
  transition: border-color 0.3s;
  min-height: 54px;
  padding: 0.5rem calc(1rem + 0.25rem);
  box-sizing: border-box;

  &:focus-within {
    outline: 1px solid ${({ $status }) => statusColorsMap[$status]};
    border-color: ${({ $status }) => statusColorsMap[$status]};
  }

  & > input,
  & > textarea {
    font-size: 1rem;
    width: 100%;
    height: calc(54px - 1rem);
    border: none;
    background-color: transparent;
    box-sizing: border-box;
    line-height: 1.5;

    &:focus {
      outline: none;
    }
  }

  & > input:-webkit-autofill,
  & > textarea:-webkit-autofill {
    -webkit-text-fill-color: #000;
    transition: background-color 9999s ease-in-out 0s;
  }
`;

export const StyledLabel = styled.label<{ $backgroundColor: string }>`
  position: absolute;
  left: 1rem;
  top: calc(50% + 5px);
  font-size: 1rem;
  color: rgba(var(--primary-color), 1);
  background-color: transparent;
  padding: 0 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  border-radius: 1rem;

  input:focus + &,
  textarea:focus + &,
  input:not(:placeholder-shown) + &,
  textarea:not(:placeholder-shown) + & {
    top: 10px;
    font-size: 0.75rem;
    background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};
  }
`;

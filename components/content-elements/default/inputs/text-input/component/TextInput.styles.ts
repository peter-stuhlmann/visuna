// TextInput.styles.ts
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
  /* mehr Platz rechts für den Icon-Button */
  padding: 0.5rem 3rem 0.5rem 1rem;
  box-sizing: border-box;
  position: relative;

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
    font-family: inherit;
    resize: none;

    &:focus {
      outline: none;
    }
  }

  & > textarea {
    height: 100px;
  }

  & > input:-webkit-autofill,
  & > textarea:-webkit-autofill {
    -webkit-text-fill-color: #000;
    transition: background-color 9999s ease-in-out 0s;
  }

  button {
    &.end {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      background: none;
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      border: none;

      svg {
        color: oklch(27.9% 0.041 260.031);
      }
    }
  }
`;

export const StyledLabel = styled.label<{ $backgroundColor: string }>`
  position: absolute;
  left: 1rem;
  top: 50%;
  font-size: 1rem;
  color: rgba(var(--primary-color), 1);
  background-color: transparent;
  padding: 0 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  border-radius: 1rem;
  white-space: nowrap;

  /* WICHTIG: statt "+" (direkter Nachbar) jetzt "~" (irgendein späteres Sibling),
     weil zwischen input/textarea und label jetzt ein button sitzt. */
  input:focus ~ &,
  textarea:focus ~ &,
  input:not(:placeholder-shown) ~ &,
  textarea:not(:placeholder-shown) ~ & {
    top: 0;
    font-size: 0.75rem;
    background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};
  }
`;

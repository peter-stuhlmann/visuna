import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  padding-top: 10px;
`;

export const CheckboxWrapper = styled.label<{ htmlFor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;

  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  margin: 0;
  padding: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  border: 0;
  overflow: hidden;

  &:focus-visible + div {
    outline: 2px solid rgba(var(--primary-color), 1);
    outline-offset: 2px;
  }
`;

export const Box = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid rgba(0, 0, 0, 0.35);
  background-color: #fff;
  display: grid;
  place-items: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &[data-checked='true'],
  &[data-indeterminate='true'] {
    background-color: rgba(var(--primary-color), 1);
    border-color: rgba(var(--primary-color), 1);
    color: #fff;
  }

  &[data-disabled='true'] {
    opacity: 0.7;
  }
`;

export const Checkmark = styled.svg`
  width: 16px;
  height: 16px;
  color: transparent;
  transition: color 0.15s ease, opacity 0.15s ease;

  /* Haken nur zeigen, wenn checked */
  path {
    opacity: 0;
  }

  /* Strich für indeterminate */
  rect {
    opacity: 0;
  }

  &[data-checked='true'] path {
    opacity: 1;
    color: currentColor;
  }

  &[data-indeterminate='true'] rect {
    opacity: 1;
    color: currentColor;
  }
`;

export const LabelText = styled.span`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.9);
`;

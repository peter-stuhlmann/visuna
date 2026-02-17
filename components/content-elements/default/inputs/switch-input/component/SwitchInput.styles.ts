import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  padding-top: 10px;
`;

export const SwitchWrapper = styled.label<{ htmlFor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;

  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Visually hidden, remains in the form flow
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
`;

export const Track = styled.div`
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  transition: background-color 0.2s ease, outline-color 0.2s ease;
  background-color: rgba(0, 0, 0, 0.2);

  &[data-checked='true'] {
    background-color: rgba(var(--primary-color), 1);
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--primary-color), 1);
    outline-offset: 2px;
  }
`;

export const Thumb = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;

  &[data-checked='true'] {
    transform: translateX(20px);
  }
`;

export const LabelText = styled.span`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.9);
`;

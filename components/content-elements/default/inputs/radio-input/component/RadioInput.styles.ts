import styled from 'styled-components';

export const GroupContainer = styled.div`
  width: 100%;
  padding-top: 10px;

  &[data-disabled='true'] {
    opacity: 0.6;
    pointer-events: none;
  }
`;

export const GroupLabel = styled.div`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

export const OptionLine = styled.div`
  display: flex;
  align-items: center;

  &[data-orientation='vertical'] {
    margin-bottom: 0.4rem;
  }

  &[data-orientation='horizontal'] {
    display: inline-flex;
    margin-right: 1rem;
  }
`;

export const RadioOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;

  &[data-disabled='true'] {
    cursor: not-allowed;
  }
`;

export const HiddenRadio = styled.input`
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

export const Bullet = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1.5px solid rgba(0, 0, 0, 0.35);
  background-color: #fff;
  display: grid;
  place-items: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background-color: rgba(var(--primary-color), 1);
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  &[data-checked='true'] {
    border-color: rgba(var(--primary-color), 1);
  }

  &[data-checked='true']::after {
    opacity: 1;
    transform: scale(1);
  }

  &[data-disabled='true'] {
    opacity: 0.8;
  }
`;

export const LabelText = styled.span`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.9);
`;

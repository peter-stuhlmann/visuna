'use client';

import styled from 'styled-components';

export const ColorInputContainer = styled.div`
  position: relative;
  padding-top: 10px;
  width: 100%;
`;

export const StyledLabel = styled.label<{ $backgroundColor?: string }>`
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
  top: 10px;
  font-size: 0.75rem;
  background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};
`;

export const ColorInputWrapper = styled.div<{ $backgroundColor?: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};

  &:focus-within {
    outline: 1px solid rgba(var(--primary-color), 1);
    border-color: rgba(var(--primary-color), 1);
  }

  input {
    width: inherit;
    font-family: inherit;
    text-transform: uppercase;
  }
`;

export const ColorPickerWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
`;

export const ColorPreview = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  cursor: pointer;
  background-color: ${({ $invalid }) => ($invalid ? '#fff' : 'transparent')};
`;

export const InvalidOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(
    45deg,
    #ccc,
    #ccc 5px,
    #eee 5px,
    #eee 10px
  );
  pointer-events: none; // wichtig: Mausereignisse an Input weitergeben
`;

export const ColorHexInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;

  &:focus {
    outline: none;
  }
`;

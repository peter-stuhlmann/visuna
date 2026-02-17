import styled, { css } from 'styled-components';
import {
  inputLabelLeftMap,
  inputSizeMap,
  selectBorderRadiusMap,
  selectInputPaddingMap,
  statusColorsMap,
} from '../../../styles.config';

export const Container = styled.div<{ $backgroundColor: string }>`
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding-top: 10px;
  width: 100%;
`;

export const StyledInput = styled.div<{
  $status: 'default' | 'error' | 'warning' | 'success';
  $disabled: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  border: 1px solid ${({ $status }) => statusColorsMap[$status]};
  border-radius: ${({ $size }) => selectBorderRadiusMap[$size]};
  transition: border-color 0.3s;
  /* min-height: 54px; */
  padding: ${({ $size }) => selectInputPaddingMap[$size]};
  box-sizing: border-box;
  font-size: 16px;

  &:focus-within {
    outline: 1px solid ${({ $status }) => statusColorsMap[$status]};
    border-color: ${({ $status }) => statusColorsMap[$status]};
  }

  ${({ $status }) =>
    $status === 'error' &&
    css`
      border-color: #e74c3c;
    `}
  ${({ $status }) =>
    $status === 'success' &&
    css`
      border-color: #2ecc71;
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      background-color: #f0f0f0;
      color: #aaa;
      pointer-events: none;
    `}

  & > div {
    /* height: calc(54px - 1rem); */
    height: ${({ $size }) => inputSizeMap[$size]};
    line-height: 1.5;
    display: flex;
    align-items: center;
  }
`;

export const StyledDisplay = styled.div`
  user-select: none;
`;

export const StyledDropdown = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  white-space: nowrap;
`;

export const StyledOption = styled.li<{ $selected: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#f0f0f0' : 'white')};

  &:hover {
    background: #e8e8e8;
  }
`;

export const StyledLabel = styled.label<{
  $backgroundColor: string;
  $isFloating: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  position: absolute;
  left: ${({ $size }) => inputLabelLeftMap[$size]};
  top: ${({ $isFloating }) => ($isFloating ? '9px' : 'calc(50% + 5px)')};
  font-size: ${({ $isFloating }) => ($isFloating ? '12px' : '16px')};
  color: rgba(var(--primary-color), 1);
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding: 0 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  border-radius: 1rem;
  user-select: none;
  z-index: 1;
  white-space: nowrap;
`;

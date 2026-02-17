import styled, { css } from 'styled-components';
import { statusColorsMap } from '../../../styles.config';

export const Container = styled.div<{ $backgroundColor: string }>`
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding-top: 10px;
  width: 100%;
`;

export const StyledInput = styled.div<{
  $status: 'default' | 'error' | 'warning' | 'success';
  $disabled: boolean;
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
    height: calc(54px - 1rem);
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
  right: 0;
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
`;

export const StyledOption = styled.li<{ $selected: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#f0f0f0' : 'white')};

  &:hover {
    background: #e8e8e8;
  }
`;

// export const StyledLabel = styled.label<{ $backgroundColor: string }>`
//   font-size: 0.85rem;
//   font-weight: 500;
//   color: #333;
//   margin-top: 4px;
//   display: block;
// `;
// export const StyledLabel = styled.label<{ $backgroundColor: string }>`
//   position: absolute;
//   left: 1rem;
//   top: calc(50% + 5px);
//   font-size: 1rem;
//   color: rgba(var(--primary-color), 1);
//   background-color: transparent;
//   padding: 0 0.25rem;
//   transform: translateY(-50%);
//   transition: all 0.2s ease-out;
//   pointer-events: none;
//   border-radius: 1rem;
//   user-select: none;

//   ul:focus + & {
//     top: 10px;
//     font-size: 0.75rem;
//     background-color: ${({ $backgroundColor }) => `${$backgroundColor}`};
//   }
// `;

export const StyledLabel = styled.label<{
  $backgroundColor: string;
  $isFloating: boolean;
}>`
  position: absolute;
  left: 1rem;
  top: ${({ $isFloating }) => ($isFloating ? '10px' : 'calc(50% + 5px)')};
  font-size: ${({ $isFloating }) => ($isFloating ? '0.75rem' : '1rem')};
  color: rgba(var(--primary-color), 1);
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding: 0 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  border-radius: 1rem;
  user-select: none;
  z-index: 1;
`;

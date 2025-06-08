import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  position: relative;
  margin: 0 0 1rem -0.5rem;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  font-family: Roboto, sans-serif;

  &:hover {
    & > div {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;

export const StyledInputWrapper = styled.div`
  flex: 0 0 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  transition: 0.2s;

  input {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    z-index: 1;
    cursor: pointer;
  }
`;

const borderRadiusMap = {
  checkbox: '0.25rem',
  radio: '50%',
};

export const StyledCustomControl = styled.div<{
  $checked: boolean;
  $type: 'checkbox' | 'radio';
  $color?: string;
  $checkedColor?: string;
}>`
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid ${({ $checkedColor }) => $checkedColor};
  box-sizing: border-box;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ $type }) => borderRadiusMap[$type]};

  ${({ $type, $checked, $color, $checkedColor }) =>
    $type === 'radio' &&
    `
    &::after {
      content: '';
      display: block;
      width: 0.875rem;
      height: 0.875rem;
      background-color: ${$checked ? $checkedColor : $color};
      border-radius: 50%;
    }
  `};
`;

export const StyledLabel = styled.label`
  cursor: pointer;
  user-select: none;
`;

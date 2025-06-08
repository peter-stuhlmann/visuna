import styled from 'styled-components';
import { statusColorsMap } from '../../../styles.config';

export const Wrapper = styled.div`
  position: relative;
`;

export const StyledInput = styled.div<{
  $status: 'default' | 'error' | 'warning' | 'success';
}>`
  & > input,
  & > textarea {
    font-size: 1rem;
    padding: 0.5rem calc(1rem + 0.25rem);
    display: block;
    width: 100%;
    border: 1px solid ${({ $status }) => statusColorsMap[$status]};
    border-radius: 1rem;
    background-color: transparent;
    transition: border-color 0.3s;
    min-height: 54px;
    box-sizing: border-box;
    line-height: 1.5;

    &:focus {
      outline: 1px solid ${({ $status }) => statusColorsMap[$status]};
      border: 1px solid ${({ $status }) => statusColorsMap[$status]};
    }
  }
`;

export const StyledLabel = styled.label<{
  $shrink: boolean;
  $backgroundColor: string;
}>`
  position: absolute;
  left: 1rem;
  top: ${({ $shrink }) => ($shrink ? '0' : '50%')};
  font-size: ${({ $shrink }) => ($shrink ? '0.75rem' : '1rem')};
  color: ${({ $shrink }) =>
    $shrink
      ? 'rgba(var(--primary-color), 1)'
      : 'rgba(var(--primary-color), 1)'};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  padding: 0 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  border-radius: 1rem;
`;

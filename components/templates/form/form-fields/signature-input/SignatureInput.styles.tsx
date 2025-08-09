'use client';

import styled from 'styled-components';

export const SignatureWrapper = styled.div<{ $error: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 600px;
  position: relative;

  & > canvas {
    background-color: rgb(255, 255, 255);
    border: 1px solid
      ${({ $error }) => ($error ? 'red' : 'var(--primary-color)')};
    border-radius: 4px;
  }
`;

export const ValidationIconWapper = styled.div<{ $isValid: boolean }>`
  position: absolute;
  width: 30px;
  height: 30px;
  right: 10px;
  top: 10px;
  border-radius: 50%;
  background-color: ${({ $isValid }) =>
    $isValid ? 'rgba(0, 175, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'};

  & > svg {
    fill: ${({ $isValid }) => ($isValid ? 'rgb(0, 175, 0)' : 'rgb(255, 0, 0)')};
  }
`;

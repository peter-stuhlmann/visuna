'use client';

import styled, { css } from 'styled-components';
import { SnackbarProps } from './Status.types';

export const SnackbarList = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 9999;
  max-width: 600px;
  width: calc(100% - 2rem);
`;

export const SnackbarWrapper = styled.div`
  width: 100%;
`;

export const Container = styled.div<{ $success: boolean }>`
  color: ${(p) => (p.$success ? 'var(--success-color)' : 'var(--error-color)')};
  box-sizing: border-box;
  text-align: center;
  margin: 20px 0;
`;

export const AlertBox = styled.div<{ $type: SnackbarProps['type'] }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return css`
          background-color: #2e7d32;
        `;
      case 'error':
        return css`
          background-color: #d32f2f;
        `;
      case 'warning':
        return css`
          background-color: #ed6c02;
        `;
      case 'info':
        return css`
          background-color: #0288d1;
        `;
      default:
        return css`
          background-color: #333;
        `;
    }
  }}
`;

export const Message = styled.div`
  flex: 1;
  padding-right: 1rem;
`;

export const CloseButton = styled.button`
  background: none;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
`;

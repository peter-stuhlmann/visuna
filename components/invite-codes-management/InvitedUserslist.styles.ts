'use client';

import styled, { keyframes } from 'styled-components';

export const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 2rem;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  border-radius: 1rem;
  overflow: hidden;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
  }

  th {
    background-color: #f9f9f9;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const ActionButton = styled.button<{ $color: string }>`
  background: none;
  border: none;
  color: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0.25rem;

  &:hover {
    opacity: 0.8;
  }
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #ccc;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

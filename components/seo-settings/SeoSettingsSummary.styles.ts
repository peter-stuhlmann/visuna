import styled from 'styled-components';

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 10px;
`;

export const Title = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #111827;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SaveButton = styled.button<{ $dirty?: boolean }>`
  height: 34px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$dirty ? '#2563eb' : '#d1d5db')};
  background: ${(p) => (p.$dirty ? 'rgba(37,99,235,0.08)' : '#fff')};
  padding: 0 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #111827;

  &:hover {
    background: ${(p) => (p.$dirty ? 'rgba(37,99,235,0.12)' : '#f9fafb')};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

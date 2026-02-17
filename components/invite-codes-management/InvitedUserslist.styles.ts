import styled, { keyframes } from 'styled-components';
export const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 2rem;
`;

export const UserCard = styled.div<{ $highlight?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ $highlight }) => ($highlight ? '#f8f9fa' : '#ffffff')};
  border: 1px solid #e5e7eb;
  transition: 0.2s ease;

  &:hover {
    background-color: ${({ $highlight }) =>
    $highlight ? '#eef0f3' : 'rgba(243, 244, 246, 0.5)'};
  }
`;

export const UserInfoCell = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: center;
`;

export const UserName = styled.div`
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserEmail = styled.div`
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RoleCell = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
`;

export const StatusCell = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
`;

export const ActionsCell = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 40px;
`;

export const ActionButton = styled.button<{ $color?: string; $bg?: string }>`
  width: 34px;
  height: 34px;
  background: ${({ $bg }) => $bg || '#fff'};
  border: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color || '#111'};
  outline: none;
  border-radius: 10px;
  padding: 0;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $bg }) => ($bg ? `${$bg}dd` : '#f3f4f6')};
  }
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
`;

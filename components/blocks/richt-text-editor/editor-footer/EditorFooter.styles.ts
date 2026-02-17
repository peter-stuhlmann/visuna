import styled from 'styled-components';

export const Container = styled.div`
  border-top: 1px solid #e5e7eb;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.75rem;
  color: #6b7280;

  & > div {
    display: flex;
    gap: 10px;
    align-items: center;
  }
`;

export const FooterInfo = styled.span``;

export const ResizeHandle = styled.button`
  border: none;
  background: transparent;
  cursor: ns-resize;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 4px;
  color: #6b7280;

  &:hover {
    background-color: #e5e7eb;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
`;

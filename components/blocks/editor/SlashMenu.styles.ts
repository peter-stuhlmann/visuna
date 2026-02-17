'use client';

import styled from 'styled-components';

export const SlashPanel = styled.div`
  width: 320px;
  max-height: 340px;
  overflow: auto;

  background: #0b1220;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  padding: 6px;
  outline: none;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 12px;
  }
`;

export const SlashRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;

  padding: 10px;
  border-radius: 10px;

  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255,255,255,0.28)' : 'transparent')};
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.10)' : 'transparent'};
  cursor: pointer;
  color: white;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const SlashIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);

  font-size: 14px;
`;

export const SlashText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SlashTitle = styled.div`
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
`;

export const SlashDesc = styled.div`
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.72);
`;

export const SlashEmpty = styled.div`
  padding: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
`;

// ----------------------
// Table grid picker
// ----------------------

export const TableGridWrap = styled.div`
  padding: 6px;
`;

export const BackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const BackButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const TableGridHeader = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  margin: 6px 0 10px;
`;

export const TableGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
`;

export const TableGridRow = styled.div`
  display: flex;
  gap: 4px;
`;

export const TableGridCell = styled.button<{ $selected?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  cursor: pointer;

  border: 1px solid rgba(255, 255, 255, 0.14);
  background: ${({ $selected }) =>
    $selected ? 'rgba(37,99,235,0.55)' : 'rgba(255,255,255,0.06)'};

  &:hover {
    background: ${({ $selected }) =>
      $selected ? 'rgba(37,99,235,0.65)' : 'rgba(255,255,255,0.10)'};
  }
`;

export const TableGridHint = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

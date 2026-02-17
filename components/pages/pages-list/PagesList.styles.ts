import styled, { keyframes } from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: 16px;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 10px;
    background-color: #f4f4f4;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }

  td {
    padding: 10px;
    border-top: 1px solid #eee;
    vertical-align: top;
    white-space: nowrap;
  }

  tr:hover td {
    background-color: #fafafa;
  }
`;

export const ActionCell = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;

  select {
    padding: 4px 8px;
  }

  nav button {
    padding: 4px 8px;
    margin-left: 4px;
  }

  nav button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const QuickFilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;

  @container resizable-area (max-width: 660px) {
    flex-wrap: wrap;

    & > input {
      flex: 1 1 100%;
    }
  }
`;

export const QuickInput = styled.input`
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 14px;
  box-sizing: border-box;
`;

export const FilterIconButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const FilterDrawer = styled.div<{ $open: boolean }>`
  overflow: hidden;
  transition: all 0.35s ease;
  max-height: ${(p) => (p.$open ? '600px' : '0')};
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: translateY(${(p) => (p.$open ? '0' : '-8px')});
  margin-bottom: ${(p) => (p.$open ? '20px' : '0')};
`;

export const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SortSelect = styled.select`
  appearance: none;
  height: 44px;
  flex: 1;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0 36px 0 16px;
  background-color: white;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  cursor: pointer;
  font-size: 14px;
  min-width: 180px;
  box-sizing: border-box;

  @container resizable-area (max-width: 660px) {
    min-width: 0;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const ViewMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
  z-index: 50;
  
  opacity: ${(p) => (p.$open ? 1 : 0)};
  visibility: ${(p) => (p.$open ? 'visible' : 'hidden')};
  transform: translateY(${(p) => (p.$open ? '0' : '-10px')});
  transition: all 0.2s ease;
`;

export const ViewMenuItem = styled.button<{ $active?: boolean }>`
  background: ${(p) => (p.$active ? '#f3f4f6' : 'transparent')};
  color: ${(p) => (p.$active ? '#111' : '#444')};
  border: none;
  text-align: left;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${(p) => (p.$active ? 500 : 400)};

  &:hover {
    background: #f9fafb;
    color: #000;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PageCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
`;

export const CardRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const CardActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #111;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #6b7280;
  
  svg {
    animation: ${rotate} 1s linear infinite;
  }
`;

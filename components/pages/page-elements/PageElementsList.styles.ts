// components/pages/page-elements/PageElementsList.styles.ts
'use client';

import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border-bottom: 1px solid #eaeaea;
  }

  tbody tr:hover {
    background-color: #f9f9f9;
  }
`;

export const Thead = styled.thead`
  background-color: #f1f1f1;
`;

export const Th = styled.th`
  text-align: left;
  font-weight: 600;
`;

export const Td = styled.td`
  white-space: nowrap;
`;

export const Tr = styled.tr``;

export const SrOnly = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

export const ModalBody = styled.div`
  position: relative;
  max-height: 100%;
`;

export const StickyBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid #eaeaea;
`;

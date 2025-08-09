'use client';

import React, { FC, ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { LogsProps } from './Logs.types';
import { getTableData } from './helpers/getTableData';

const Container = styled.div`
  margin-top: 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background-color: #f5f5f5;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #fafafa;
  }
`;

const Th = styled.th<{ width?: number }>`
  text-align: left;
  padding: 8px;
  width: ${({ width }) => (width ? `${width}px` : 'auto')};
  border-bottom: 2px solid #ccc;
  cursor: ${({ width }) => (width ? 'pointer' : 'default')};
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;

  select {
    padding: 4px;
  }

  button {
    padding: 4px 8px;
    border: none;
    background: #0070f3;
    color: white;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const Logs: FC<LogsProps> = ({ logs }) => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);

  const tableData = getTableData(logs);

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setPage((prev) =>
      logs ? Math.min(prev + 1, Math.ceil(logs.length / rowsPerPage) - 1) : prev
    );

  const pagedLogs =
    logs?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) || [];

  return (
    <Container>
      <StyledTable>
        <Thead>
          <Tr>
            {tableData.map((col, i) => (
              <Th key={i}>{col.thead}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {pagedLogs.length > 0 ? (
            pagedLogs.map((_, rowIndex) => (
              <Tr key={rowIndex}>
                {tableData.map((col, colIndex) => (
                  <Td key={colIndex}>
                    {col.tbody
                      ? col.tbody[page * rowsPerPage + rowIndex] || null
                      : null}
                  </Td>
                ))}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={tableData.length} style={{ textAlign: 'center' }}>
                Keine Daten verfügbar
              </Td>
            </Tr>
          )}
        </Tbody>
      </StyledTable>

      {logs && logs.length > rowsPerPage && (
        <PaginationControls>
          <span>Einträge pro Seite:</span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[10, 20, 50, logs.length].map((n) => (
              <option key={n} value={n}>
                {n === logs.length ? 'Alle' : n}
              </option>
            ))}
          </select>

          <button onClick={handlePrevPage} disabled={page === 0}>
            ◀
          </button>
          <span>
            Seite {page + 1} von {Math.ceil(logs.length / rowsPerPage)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= Math.ceil(logs.length / rowsPerPage) - 1}
          >
            ▶
          </button>
        </PaginationControls>
      )}
    </Container>
  );
};

export default Logs;

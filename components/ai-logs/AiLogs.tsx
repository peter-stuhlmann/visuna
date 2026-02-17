'use client';

import React, { FC, ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { AiLogsProps } from './AiLogs.types';

const Container = styled.div`
  margin-top: 1rem;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const StatValue = styled.span`
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
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

const Th = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid #ccc;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #374151;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SourceBadge = styled.span<{ $source: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${({ $source }) =>
    $source === 'chatbot'
      ? '#dbeafe'
      : $source === 'translation'
      ? '#d1fae5'
      : '#f3f4f6'};
  color: ${({ $source }) =>
    $source === 'chatbot'
      ? '#1e40af'
      : $source === 'translation'
      ? '#065f46'
      : '#374151'};
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCost(cents: number): string {
  return cents.toFixed(5) + ' ct';
}

function sourceLabel(s: string): string {
  switch (s) {
    case 'chatbot': return 'Chatbot';
    case 'translation': return 'Übersetzung';
    default: return s;
  }
}

const AiLogs: FC<AiLogsProps> = ({ logs, stats }) => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(0);

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setPage((prev) =>
      Math.min(prev + 1, Math.ceil(logs.length / rowsPerPage) - 1)
    );

  const pagedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container>
      {/* Stats Bar */}
      <StatsBar>
        <StatItem>
          <StatLabel>Anfragen gesamt</StatLabel>
          <StatValue>{stats.count.toLocaleString('de-DE')}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Tokens gesamt</StatLabel>
          <StatValue>{stats.totalTokens.toLocaleString('de-DE')}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Kosten gesamt</StatLabel>
          <StatValue>{formatCost(stats.totalCostEurCent)}</StatValue>
        </StatItem>
      </StatsBar>

      {/* Table */}
      <StyledTable>
        <Thead>
          <Tr>
            <Th>Datum</Th>
            <Th>Quelle</Th>
            <Th>Eingabe</Th>
            <Th>Aktion</Th>
            <Th>Output</Th>
            <Th>Model</Th>
            <Th>In</Th>
            <Th>Out</Th>
            <Th>Kosten</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pagedLogs.length > 0 ? (
            pagedLogs.map((log, i) => (
              <Tr key={i}>
                <Td>{formatDate(log.createdAt)}</Td>
                <Td>
                  <SourceBadge $source={log.source}>{sourceLabel(log.source)}</SourceBadge>
                </Td>
                <Td title={log.userInput}>{log.userInput}</Td>
                <Td title={log.action}>{log.action}</Td>
                <Td title={log.output}>{log.output}</Td>
                <Td>{log.model}</Td>
                <Td>{log.inputTokens.toLocaleString('de-DE')}</Td>
                <Td>{log.outputTokens.toLocaleString('de-DE')}</Td>
                <Td>{formatCost(log.costEurCent)}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={9} style={{ textAlign: 'center' }}>
                Noch keine AI-Interaktionen protokolliert.
              </Td>
            </Tr>
          )}
        </Tbody>
      </StyledTable>

      {/* Pagination */}
      {logs.length > rowsPerPage && (
        <PaginationControls>
          <span>Einträge pro Seite:</span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[20, 50, 100, logs.length].map((n) => (
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

export default AiLogs;

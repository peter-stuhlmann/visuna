'use client';

import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { getTableData } from './utils/getTableData';
import { Page } from '../Pages.types';
import AddNewPageDialog from './AddNewPageDialog';
import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';
import { Button } from '@/components/content-elements/default';
import { useStatus } from '@/components/status/StatusContext';

type PagesListProps = {
  pagesList: Page[] | null;
};

export type PublishedStatus = { [slug: string]: boolean };

const PagesList: FC<PagesListProps> = ({ pagesList }) => {
  const [pages, setPages] = useState<Page[] | null>(pagesList);
  const [open, setOpen] = useState(false);
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState<string>('');
  const [isSlugTaken, setIsSlugTaken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const { selectedWorkspace } = useSelectedWorkspace();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);

  const [publishedStatus, setPublishedStatus] = useState<PublishedStatus>(
    pages?.reduce((acc, page) => {
      acc[page.slug] = page.published ?? false;
      return acc;
    }, {} as PublishedStatus) || {}
  );

  const router = useRouter();

  const { addStatus } = useStatus();

  useEffect(() => {
    if (slug.trim()) {
      const slugExists = pagesList?.some((page) => page.slug === slug);
      setIsSlugTaken(!!slugExists);
      setSlugError(slugExists ? 'Dieser Slug ist bereits vergeben.' : null);
    } else {
      setIsSlugTaken(false);
      setSlugError(null);
    }
  }, [slug, pagesList]);

  const handleNewPage = () => {
    setOpen(true);
    setPageName('');
    setSlug('');
    setNameError(null);
    setSlugError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setNameError(null);
    setSlugError(null);
  };

  const handleSave = async () => {
    setNameError(null);
    setSlugError(null);

    let hasError = false;
    if (!pageName.trim()) {
      setNameError('Seitenname ist erforderlich.');
      hasError = true;
    }
    if (!slug.trim()) {
      setSlugError('Slug ist erforderlich.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: pageName, slug }),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern der Seite.');

      const res = await response.json();
      setPages((prevPages) =>
        prevPages ? [...prevPages, res.newPage] : [res.newPage]
      );
      addStatus({
        type: 'success',
        message: `Seite "${pageName}" wurde erfolgreich erstellt.`,
      });

      if (selectedWorkspace) {
        router.push(
          `/workspaces/${selectedWorkspace._id}/seiten/${res.newPage._id}`
        );
      }

      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Möchtest Du die Seite ${name} wirklich löschen?`)) return;

    try {
      const response = await fetch('/api/delete-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Fehler beim Löschen der Seite.');

      setPages(
        (prevPages) => prevPages?.filter((page) => page._id !== id) || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const tableData = getTableData(
    handleDelete,
    publishedStatus,
    setPublishedStatus,
    selectedWorkspace?._id
  );

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const [sortColumn, setSortColumn] = useState<string | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string | null) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  };

  const sortedPages = pages?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    // 1) Rohwerte aus dem Objekt holen, Typ: unknown
    const rawA = a[sortColumn as keyof Page];
    const rawB = b[sortColumn as keyof Page];

    // 2) Hilfsvariablen für den Vergleich
    let compA: string | number;
    let compB: string | number;

    // 2a) Datums-Feld
    if (sortColumn === 'createdAt') {
      compA = new Date((rawA as string) || '').getTime() || 0;
      compB = new Date((rawB as string) || '').getTime() || 0;
    }
    // 2b) Boolean-Feld
    else if (typeof rawA === 'boolean' || typeof rawB === 'boolean') {
      compA = rawA === true ? 1 : 0;
      compB = rawB === true ? 1 : 0;
    }
    // 2c) Array-Feld
    else if (Array.isArray(rawA) || Array.isArray(rawB)) {
      compA = Array.isArray(rawA)
        ? rawA.map(String).join(', ').toLowerCase()
        : '';
      compB = Array.isArray(rawB)
        ? rawB.map(String).join(', ').toLowerCase()
        : '';
    }
    // 2d) alles andere als String behandeln (inkl. undefined/null → '')
    else {
      compA = String(rawA ?? '').toLowerCase();
      compB = String(rawB ?? '').toLowerCase();
    }

    // 3) Vergleich
    if (compA < compB) return sortDirection === 'asc' ? -1 : 1;
    if (compA > compB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil((sortedPages?.length || 0) / rowsPerPage);

  return (
    <>
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              {tableData.map((table, index) => (
                <th
                  key={index}
                  style={{ width: table.width }}
                  onClick={() => table.field && handleSort(table.field)}
                >
                  {table.thead}
                  {table.field === sortColumn
                    ? sortDirection === 'asc'
                      ? ' ▲'
                      : ' ▼'
                    : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPages && sortedPages.length > 0 ? (
              sortedPages
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((page, rowIndex) => (
                  <tr key={page._id || rowIndex}>
                    {tableData.map((table, colIndex) => (
                      <td key={`${page._id}-${colIndex}`}>
                        {table.field
                          ? (() => {
                              const value = page[table.field as keyof Page];
                              if (Array.isArray(value)) {
                                return value.map((item, i) => (
                                  <div key={i}>{String(item)}</div>
                                ));
                              }
                              return table.format
                                ? table.format(value as string)
                                : value ?? '';
                            })()
                          : typeof table.tbody === 'function'
                          ? (() => {
                              const tbodyContent = table.tbody(page);
                              return Array.isArray(tbodyContent)
                                ? tbodyContent.map((item, index) => (
                                    <div key={index}>{item}</div>
                                  ))
                                : tbodyContent;
                            })()
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={tableData.length} style={{ textAlign: 'center' }}>
                  Keine Daten verfügbar
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>

      {sortedPages && sortedPages.length > 10 && (
        <PaginationControls>
          <span>Einträge pro Seite: </span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[10, 20, 50, sortedPages.length].map((n) => (
              <option key={n} value={n}>
                {n === sortedPages.length ? 'Alle' : n}
              </option>
            ))}
          </select>

          <span style={{ marginLeft: '20px' }}>
            Seite {page + 1} von {totalPages}
          </span>

          <nav>
            <button onClick={() => handlePageChange(0)} disabled={page === 0}>
              ⏮
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
            >
              ◀
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              ▶
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              ⏭
            </button>
          </nav>
        </PaginationControls>
      )}

      <Button onClick={handleNewPage}>Neue Seite anlegen</Button>

      <AddNewPageDialog
        isOpen={open}
        handleClose={handleClose}
        pageName={pageName}
        setPageName={setPageName}
        nameError={nameError}
        slugError={slugError}
        slug={slug}
        setSlug={setSlug}
        isSlugTaken={isSlugTaken}
        isLoading={isLoading}
        handleSave={handleSave}
      />
    </>
  );
};

export default PagesList;

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

    &:nth-of-type(5) {
      display: flex;
      gap: 0.5rem;
    }
  }

  tr:hover td {
    background-color: #fafafa;
  }
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

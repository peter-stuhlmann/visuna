'use client';

import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { getTableData } from './helpers/getTableData';
import { Form } from '@/app/(backend)/workspaces/[id]/formularverwaltung/helpers/getForms';
import renderCellValue from './helpers/renderCellValue';
import { Button, TextInput } from '../content-elements/default';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';

const Container = styled.div`
  margin-top: 1rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ width?: number }>`
  text-align: left;
  padding: 8px;
  width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
  border-bottom: 2px solid #ccc;
  cursor: pointer;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
`;

const Tr = styled.tr``;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Dialog = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
`;

const Forms: FC<{ formsList: Form[] | null }> = ({ formsList }) => {
  const [forms, setForms] = useState<Form[] | null>(formsList);
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTaken, setIsSlugTaken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  // const [rowsPerPage, setRowsPerPage] = useState(2);
  // const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const page = 0;

  const [sortColumn, setSortColumn] = useState<string | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [publishedStatus, setPublishedStatus] = useState<{
    [key: string]: boolean;
  }>(
    forms?.reduce((acc, form) => {
      acc[form.slug] = form.published ?? false;
      return acc;
    }, {} as { [key: string]: boolean }) || {}
  );

  const router = useRouter();

  const { selectedWorkspace } = useSelectedWorkspace();

  useEffect(() => {
    if (slug.trim()) {
      const slugExists = formsList?.some((form) => form.slug === slug);
      setIsSlugTaken(!!slugExists);
      setSlugError(slugExists ? 'Dieser Slug ist bereits vergeben.' : null);
    } else {
      setIsSlugTaken(false);
      setSlugError(null);
    }
  }, [slug, formsList]);

  const handleNewForm = () => {
    setOpen(true);
    setFormName('');
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
    if (!formName.trim()) {
      setNameError('Formularname ist erforderlich.');
      hasError = true;
    }
    if (!slug.trim()) {
      setSlugError('Formular-Slug ist erforderlich.');
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/create-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, slug }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForms((prev) => (prev ? [...prev, data.newForm] : [data.newForm]));
      router.push(
        `/workspaces/${selectedWorkspace?._id}/formularverwaltung/${data.newForm.slug}`
      );
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Möchtest Du das Formular ${id} wirklich löschen?`)) return;
    try {
      const res = await fetch('/api/delete-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setForms((prev) => prev?.filter((f) => f._id !== id) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (field?: string | null) => {
    // optional: normalize undefined → null
    const normalized = field ?? null;
    // …
    const isAsc = sortColumn === normalized && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(normalized);
  };

  const sortedForms = forms?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    // 1) Rohwerte holen
    const rawA = a[sortColumn as keyof Form];
    const rawB = b[sortColumn as keyof Form];

    // 2) Komponente-Werte für Vergleich
    let compA: string | number;
    let compB: string | number;

    // 2a) Datum
    if (sortColumn === 'createdAt') {
      compA = new Date((rawA as string) ?? '').getTime() || 0;
      compB = new Date((rawB as string) ?? '').getTime() || 0;
    }
    // 2b) Boolean
    else if (typeof rawA === 'boolean' || typeof rawB === 'boolean') {
      compA = rawA === true ? 1 : 0;
      compB = rawB === true ? 1 : 0;
    }
    // 2c) Array
    else if (Array.isArray(rawA) || Array.isArray(rawB)) {
      compA = Array.isArray(rawA)
        ? rawA.map(String).join(', ').toLowerCase()
        : '';
      compB = Array.isArray(rawB)
        ? rawB.map(String).join(', ').toLowerCase()
        : '';
    }
    // 2d) sonst Strings (oder undefined → '')
    else {
      compA = String(rawA ?? '').toLowerCase();
      compB = String(rawB ?? '').toLowerCase();
    }

    // 3) Endgültiger Vergleich
    if (compA < compB) return sortDirection === 'asc' ? -1 : 1;
    if (compA > compB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const tableData = getTableData(
    forms,
    handleDelete,
    publishedStatus,
    setPublishedStatus,
    selectedWorkspace?._id
  );

  return (
    <Container>
      <StyledTable>
        <thead>
          <Tr>
            {tableData.map((col, i) => (
              <Th
                key={i}
                width={col.width}
                onClick={() => handleSort(col.field)}
              >
                {col.thead}
              </Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {sortedForms?.length ? (
            sortedForms
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((form, i) => (
                <Tr key={form._id || i}>
                  {tableData.map((col, j) => (
                    <Td key={j}>{renderCellValue(form, col)}</Td>
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
        </tbody>
      </StyledTable>

      {/* {sortedForms && sortedForms.length > 10 && (
        <TablePagination
          component="div"
          labelRowsPerPage="Einträge pro Seite:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} von ${count}`
          }
          count={sortedForms?.length || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[
            10,
            20,
            50,
            { label: 'Alle', value: sortedForms.length },
          ]}
        />
      )} */}

      <Button onClick={handleNewForm}>Neues Formular anlegen</Button>

      {open && (
        <DialogOverlay>
          <Dialog>
            <h3>Neues Formular anlegen</h3>
            <TextInput
              label="Formularname"
              value={formName}
              onChange={(value) => setFormName(value)}
              // error={!!nameError}
            />
            {nameError && <small style={{ color: 'red' }}>{nameError}</small>}

            <TextInput
              label="Slug"
              value={slug}
              onChange={(value) => setSlug(value)}
              // error={!!slugError || isSlugTaken}
            />
            {slugError && <small style={{ color: 'red' }}>{slugError}</small>}

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleClose} disabled={isLoading}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formName.trim() || !slug.trim() || isSlugTaken || isLoading
                }
              >
                {isLoading ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </Dialog>
        </DialogOverlay>
      )}
    </Container>
  );
};

export default Forms;

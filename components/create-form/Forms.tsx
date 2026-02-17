'use client';

import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { getTableData } from './helpers/getTableData';
import { Form } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';
import renderCellValue from './helpers/renderCellValue';
import { Button, TextInput } from '../content-elements/default';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

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
  inset: 0;
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

export type FormPublishStatusMap = {
  [slug: string]: PageVisibility;
};

const Forms: FC<{ formsList: Form[] | null }> = ({ formsList }) => {
  const [forms, setForms] = useState<Form[] | null>(formsList);
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTaken, setIsSlugTaken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const rowsPerPage = 10;
  const page = 0;

  const [sortColumn, setSortColumn] = useState<string | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  /* -------------------- PUBLISH STATUS MAP -------------------- */

  const [formStatus, setFormStatus] = useState<FormPublishStatusMap>(
    formsList?.reduce((acc, f) => {
      acc[f.slug] = (f.publishStatus as PageVisibility) ?? 'offline';
      return acc;
    }, {} as FormPublishStatusMap) || {}
  );

  const router = useRouter();
  const { selectedWorkspace } = useSelectedWorkspace();

  /* -------------------- SLUG VALIDATION -------------------- */

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

  /* -------------------- DIALOG -------------------- */

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

  /* -------------------- CREATE -------------------- */

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
      const res = await fetch('/api/forms/create-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, slug }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setForms((prev) => (prev ? [...prev, data.newForm] : [data.newForm]));
      setFormStatus((prev) => ({
        ...prev,
        [data.newForm.slug]: data.newForm.publishStatus ?? 'offline',
      }));

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

  /* -------------------- DELETE -------------------- */

  const handleDelete = async (id: string) => {
    if (!confirm(`Möchtest Du dieses Formular wirklich löschen?`)) return;

    try {
      const res = await fetch('/api/forms/delete-form', {
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

  /* -------------------- SORT -------------------- */

  const handleSort = (field?: string | null) => {
    const normalized = field ?? null;
    const isAsc = sortColumn === normalized && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(normalized);
  };

  const sortedForms = forms?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    const rawA = a[sortColumn as keyof Form];
    const rawB = b[sortColumn as keyof Form];

    let compA: string | number;
    let compB: string | number;

    if (sortColumn === 'createdAt') {
      compA = new Date((rawA as string) ?? '').getTime() || 0;
      compB = new Date((rawB as string) ?? '').getTime() || 0;
    } else {
      compA = String(rawA ?? '').toLowerCase();
      compB = String(rawB ?? '').toLowerCase();
    }

    if (compA < compB) return sortDirection === 'asc' ? -1 : 1;
    if (compA > compB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  /* -------------------- TABLE CONFIG -------------------- */

  const tableData = getTableData(
    forms,
    handleDelete,
    formStatus,
    setFormStatus,
    selectedWorkspace?._id
  );

  /* -------------------- RENDER -------------------- */

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

      <Button onClick={handleNewForm}>Neues Formular anlegen</Button>

      {open && (
        <DialogOverlay>
          <Dialog>
            <h3>Neues Formular anlegen</h3>

            <TextInput
              label="Formularname"
              value={formName}
              onChange={(value) => setFormName(value)}
            />
            {nameError && <small style={{ color: 'red' }}>{nameError}</small>}

            <TextInput
              label="Slug"
              value={slug}
              onChange={(value) => setSlug(value)}
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

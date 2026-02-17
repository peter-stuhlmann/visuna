import { Fragment } from 'react';
import { Form } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';
import handleFormPublishStatus from './update-form-publish-status';

import { MdEdit, MdDelete, MdPreview } from 'react-icons/md';
import { Button } from '@/components/content-elements/default';
import PageVisibilityStatus from '@/components/page-visibility-status/PageVisibilityStatus';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

/* -------------------- TYPES -------------------- */

export type FormPublishStatusMap = {
  [slug: string]: PageVisibility;
};

type SetFormStatus = (
  status:
    | FormPublishStatusMap
    | ((prev: FormPublishStatusMap) => FormPublishStatusMap)
) => void;

/* -------------------- TABLE CONFIG -------------------- */

export const getTableData = (
  forms: Form[] | null,
  handleDelete: (id: string) => void,
  formStatus: FormPublishStatusMap,
  setFormStatus: SetFormStatus,
  selectedWorkspaceId: string | undefined
) => {
  const handleStatusChange = async (slug: string, next: PageVisibility) => {
    const prev = formStatus[slug] ?? 'offline';

    // Optimistic UI
    setFormStatus((p) => ({ ...p, [slug]: next }));

    try {
      await handleFormPublishStatus(slug, next);
    } catch {
      // Rollback on error
      setFormStatus((p) => ({ ...p, [slug]: prev }));
    }
  };

  return [
    /* -------------------- NAME -------------------- */
    {
      thead: 'Name',
      field: 'name',
    },

    /* -------------------- SLUG -------------------- */
    {
      thead: 'Slug',
      field: 'slug',
    },

    /* -------------------- CREATED -------------------- */
    {
      thead: 'Angelegt',
      field: 'createdAt',
      format: (value: string) => {
        const date = new Date(value);
        return new Intl.DateTimeFormat('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date);
      },
      width: 120,
    },

    /* -------------------- PUBLISH STATUS -------------------- */
    {
      thead: 'Status',
      field: undefined,
      tbody: (form: Form) => {
        const status: PageVisibility =
          formStatus[form.slug] ??
          (form.publishStatus as PageVisibility) ??
          'offline';

        return (
          <div key={`published-${form.slug}`} className="flex-row">
            <PageVisibilityStatus
              value={status}
              onChange={(v) => handleStatusChange(form.slug, v)}
            />
          </div>
        );
      },
      width: 160,
    },

    /* -------------------- ACTIONS -------------------- */
    {
      thead: 'Aktionen',
      field: undefined,
      tbody: (form: Form) => (
        <Fragment key={`actions-${form.slug}`}>
          <Button
            href={`/workspaces/${selectedWorkspaceId}/formularverwaltung/${form.slug}`}
            aria-label="Bearbeiten"
          >
            <MdEdit aria-hidden="true" />
          </Button>

          <Button onClick={() => handleDelete(form._id)} aria-label="Löschen">
            <MdDelete aria-hidden="true" />
          </Button>

          <Button
            href={`/form/${form.slug}`}
            target="_blank"
            aria-label="Live-Vorschau"
          >
            <MdPreview aria-hidden="true" />
          </Button>
        </Fragment>
      ),
      width: 175,
    },
  ];
};

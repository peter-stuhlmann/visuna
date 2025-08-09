import { Fragment } from 'react';
import Switch from '@/components/Switch';
import { Form } from '@/app/(backend)/workspaces/[id]/formularverwaltung/helpers/getForms';
import handleFormPublishStatus from './update-form-publish-status';

import { MdEdit, MdDelete, MdPreview } from 'react-icons/md';
import { Button } from '@/components/content-elements/default';
import { PublishedStatus } from '@/components/pages/pages-list/PagesList';

type SetPublishedStatus = (
  status: PublishedStatus | ((prev: PublishedStatus) => PublishedStatus)
) => void;

export const getTableData = (
  forms: Form[] | null,
  handleDelete: (id: string) => void,
  publishedStatus: PublishedStatus,
  setPublishedStatus: SetPublishedStatus,
  selectedWorkspaceId: string | undefined
) => {
  const handleSwitchChange = (key: string) => {
    const newStatus = !publishedStatus[key];

    handleFormPublishStatus(key, newStatus);
    setPublishedStatus((prev) => ({
      ...prev,
      [key]: newStatus,
    }));
  };

  return [
    // Spalte: Formularname
    {
      thead: 'Name',
      field: 'name',
    },

    // Spalte: Key
    {
      thead: 'Slug',
      field: 'slug',
    },

    // Spalte: Angelegt (Datum)
    {
      thead: 'Angelegt',
      field: 'createdAt',
      format: (value: string) => {
        const date = new Date(value);
        return new Intl.DateTimeFormat('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date); // DD.MM.YYYY
      },
      width: 120,
    },

    // Spalte: Veröffentlicht mit Switch
    {
      thead: 'Veröffentlicht',
      field: undefined,
      tbody: (form: Form) => (
        <div key={`published-${form.slug}`} className="flex-row">
          {/* Nein */}
          <div aria-hidden="true">Nein</div>
          {/* Umschalter */}
          <Switch
            checked={!!publishedStatus[form.slug]}
            onChange={() => handleSwitchChange(form.slug)}
          />
          {/* Ja */}
          <div aria-hidden="true">Ja</div>
        </div>
      ),
      width: 150,
    },

    // Spalte: Aktionen
    {
      thead: 'Aktionen',
      field: undefined,
      tbody: (form: Form) => (
        <Fragment key={`actions-${form.slug}`}>
          {/* Bearbeiten-Button */}
          {/* <Tooltip title="Bearbeiten" arrow> */}
          <Button
            href={`/workspaces/${selectedWorkspaceId}/formularverwaltung/${form.slug}`}
            aria-label="Bearbeiten"
          >
            <MdEdit aria-hidden="true" />
          </Button>
          {/* </Tooltip> */}
          {/* Löschen-Button */}
          {/* <Tooltip title="Löschen" arrow> */}
          <Button onClick={() => handleDelete(form._id)} aria-label="Löschen">
            <MdDelete aria-hidden="true" />
          </Button>
          {/* </Tooltip> */}
          {/* Live-Vorschau-Button */}
          {/* <Tooltip title="Live-Vorschau" arrow> */}
          <Button
            href={`/form/${form.slug}`}
            target="_blank"
            aria-label="Live-Vorschau"
          >
            <MdPreview aria-hidden="true" />
          </Button>
          {/* </Tooltip> */}
        </Fragment>
      ),
      width: 175,
    },
  ];
};

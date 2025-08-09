import { Fragment } from 'react';
import { PublishedStatus } from '../PagesList';
import handlePagePublishStatus from './update-page-publish-status';
import { Page } from '../../Pages.types';
import Switch from '@/components/Switch';

import { MdEdit, MdDelete, MdPreview } from 'react-icons/md';
import { Button } from '@/components/content-elements/default';

type SetPublishedStatus = (
  status: PublishedStatus | ((prev: PublishedStatus) => PublishedStatus)
) => void;

export const getTableData = (
  handleDelete: (id: string, name: string) => void,
  publishedStatus: PublishedStatus,
  setPublishedStatus: SetPublishedStatus,
  workspaceId: string | undefined
) => {
  const handleSwitchChange = (slug: string) => {
    const newStatus = !publishedStatus[slug];

    handlePagePublishStatus(slug, newStatus);
    setPublishedStatus((prev) => ({
      ...prev,
      [slug]: newStatus,
    }));
  };

  return [
    // Spalte: Seitenname
    {
      thead: 'Name',
      field: 'name',
    },

    // Spalte: slug
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
      tbody: (page: Page) => (
        <div key={`published-${page.slug}`} className="flex-row">
          {/* Nein */}
          <div aria-hidden="true">Nein</div>
          {/* Umschalter */}
          <Switch
            checked={!!publishedStatus[page.slug]}
            onChange={() => handleSwitchChange(page.slug)}
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
      tbody: (page: Page) => (
        <Fragment key={`actions-${page.slug}`}>
          {/* Bearbeiten-Button */}
          {/* <Tooltip title="Bearbeiten" arrow> */}
          <Button
            href={`/workspaces/${workspaceId}/seiten/${page._id}/seitenelemente`}
            aria-label="Bearbeiten"
          >
            <MdEdit aria-hidden="true" />
          </Button>
          {/* </Tooltip> */}
          {/* Löschen-Button */}
          {/* <Tooltip title="Löschen" arrow> */}
          <Button
            onClick={() => handleDelete(page._id, page.name)}
            aria-label="Löschen"
          >
            <MdDelete aria-hidden="true" />
          </Button>
          {/* </Tooltip> */}
          {/* Live-Vorschau-Button */}
          {/* <Tooltip title="Live-Vorschau" arrow> */}
          <Button
            href={`/${page.slug}`}
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

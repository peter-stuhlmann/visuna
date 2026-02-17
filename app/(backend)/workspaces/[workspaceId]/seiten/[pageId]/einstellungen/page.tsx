import { notFound } from 'next/navigation';
import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import { getPage } from '../utils/getPage';
// import { getWorkspaceContentLanguages } from '@/utils/getWorkspaceLanguages';

export default async function PageElementsListPage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id, pageId } = await params;
  const page = await getPage(pageId);

  const workspaceId = id;
  // const languages = await getWorkspaceContentLanguages(workspaceId);

  if (!page) {
    return notFound();
  }

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
          },
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${pageId}/dashboard`,
                en: `/workspaces/${pageId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Seiten', en: 'Pages' },
              href: {
                de: `/workspaces/${pageId}/seiten`,
                en: `/workspaces/${pageId}/seiten`,
              },
              highlighted: false,
            },
            {
              label: { de: `Seite "${page.name}"`, en: `Page "${page.name}"` },
              href: {
                de: `/workspaces/${pageId}/seiten/${pageId}`,
                en: `/workspaces/${pageId}/seiten/${pageId}`,
              },
              highlighted: false,
            },
            {
              label: { de: `Seiten-Einstellungen`, en: `Page Settings` },
              highlighted: true,
            },
          ],
        }}
      />
      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'xxl',
          },
          children: (
            <>
              <Heading
                element="h1"
                value={`Seiten-Einstellungen für "${page.name}"`}
              />
              // TODO: <br />
              - Verlinkung zu SEO-Settings und den anderen Optionen
              <br />
              - Slug der Seite ändern // - Wenn ja, dann Canonical-Weiterleitung
              anbieten
              <br />
              - Name der Seite ändern
              <br />
              - Sicht barkjeit 3 Zustände: LIVE / offline (404) / Maintenance
              (503)
              <br />
              - Sichtbarkeit pro Sprache? Sprachen auflisten und jeweils
              LIVE/offline/Maintenace umschalten
              <br />
              - Zustandsänderung planen: zum DATUM/ZEIT von aktuell auf eins der
              beiden anderen Zustände wechseln (Möglichkeit das wieder zu
              löschen) - Zur Veröffentlichung prüfen lassen (Name angeben)
              <br />
            </>
          ),
        }}
      />
    </>
  );
}

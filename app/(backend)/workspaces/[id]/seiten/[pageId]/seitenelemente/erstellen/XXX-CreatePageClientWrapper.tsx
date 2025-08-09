'use client';

import { useRouter } from 'next/navigation';
import contentElementsMetaData from '@/data/content-elements-metadata';
import CardsGrid from '@/components/content-elements/default/cards/cards-grid';

export default function CreatePageClientWrapper({
  pageId,
}: {
  pageId: string;
}) {
  const router = useRouter();

  const cards = contentElementsMetaData.map((item) => ({
    title: item.title.de,
    teaser: item.teaser.de,
    href: '#',
    onClick: async () => {
      try {
        const res = await fetch('/api/create-page-element', {
          method: 'POST',
          body: JSON.stringify({ pageId, element: item.slug.replace('/', '') }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('[API] Fehlerhafte Antwort:', errorText);
          return;
        }

        const json = await res.json();
        console.log('[DEBUG] API Response JSON:', json);

        const id = json?.id;

        if (!id || typeof id !== 'string') {
          console.error('[router.push] Keine gültige ID erhalten!');
          return;
        }

        router.push(
          `/workspaces/${pageId}/seiten/${pageId}/seitenelemente/${id}`
        );
      } catch (error) {
        console.error(
          '[onClick] Fehler beim Erstellen des Seitenelements:',
          error
        );
      }
    },
  }));

  return <CardsGrid cards={cards} />;
}

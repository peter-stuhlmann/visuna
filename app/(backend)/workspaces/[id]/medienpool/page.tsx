import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';
import CardsGrid from '@/components/content-elements/default/cards/cards-grid';

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cards = [
    {
      title: 'Bilder',
      teaser: 'This is the first card.',
      href: `/workspaces/${id}/medienpool/bilder`,
    },
    {
      title: 'Dokumente',
      teaser: 'This is the second card.',
      href: `/workspaces/${id}/medienpool/dokumente`,
    },
  ];

  return (
    <>
      <Breadcrumbs
        links={[
          {
            label: 'Dashboard',
            href: `/workspaces/${id}/dashboard`,
            isActive: false,
          },
          {
            label: 'Medienpool',
            isActive: true,
          },
        ]}
        data={{ innerWidth: 'full' }}
      />
      <Wrapper
        data={{
          innerWidth: 'full',
          children: (
            <>
              <Heading element="h1" value="Medienpool" />

              <CardsGrid cards={cards} />
            </>
          ),
        }}
      />
    </>
  );
}

import { Heading, Wrapper } from '@/components/content-elements/default';

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Wrapper
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading element="h1" value="Medienpool" />
              <div>{id}</div>
            </>
          ),
        }}
      />
    </>
  );
}

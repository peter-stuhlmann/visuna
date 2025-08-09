import {
  Breadcrumbs,
  Heading,
  Wrapper,
} from '@/components/content-elements/default';

export default async function PageElementsListPage() {
  return (
    <>
      <Breadcrumbs
        links={[
          {
            label: 'Dashboard',
            isActive: true,
          },
        ]}
        data={{
          innerWidth: 'xl',
          marginTop: 'xl',
          paddingLeft: 'm',
          paddingRight: 'm',
          paddingTop: 'm',
          paddingBottom: 'm',
        }}
      />
      <Wrapper
        data={{
          innerWidth: 'xl',
          paddingLeft: 'm',
          paddingRight: 'm',
          paddingTop: 'm',
          paddingBottom: 'm',
          children: (
            <>
              <Heading element="h1" value={`Dashboard`} />
            </>
          ),
        }}
      />
    </>
  );
}

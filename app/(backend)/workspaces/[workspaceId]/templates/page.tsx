import {
  Breadcrumbs,
  Heading,
  Wrapper,
  UnwrappedAnimatedCards,
} from '@/components/content-elements/default';

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const cards = [
    {
      title: {
        value: { value: { de: 'Header', en: 'Header' }, element: 'h3' as const },
        color: '#0a4a7b',
        hoverColor: '#ffffff',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      subtitle: {
        value: { value: { de: 'Kopfbereich der Website verwalten', en: 'Manage website header' }, element: 'div' as const },
        color: '#666666',
        hoverColor: '#e1e1e1',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      icon: {
        name: 'LuPanelTop' as any,
        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
      },
      href: `/workspaces/${workspaceId}/templates/header`,
      overlayColor: '#0a4a7b',
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 'm' as const,
    },
    {
      title: {
        value: { value: { de: 'Footer', en: 'Footer' }, element: 'h3' as const },
        color: '#0a4a7b',
        hoverColor: '#ffffff',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      subtitle: {
        value: { value: { de: 'Fußbereich der Website verwalten', en: 'Manage website footer' }, element: 'div' as const },
        color: '#666666',
        hoverColor: '#e1e1e1',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      icon: {
        name: 'LuPanelBottom' as any,
        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
      },
      href: `/workspaces/${workspaceId}/templates/footer`,
      overlayColor: '#0a4a7b',
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 'm' as const,
    },
    {
      title: {
        value: { value: { de: 'Formulare', en: 'Forms' }, element: 'h3' as const },
        color: '#0a4a7b',
        hoverColor: '#ffffff',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      subtitle: {
        value: { value: { de: 'Kontakt- und Eingabeformulare', en: 'Contact and input forms' }, element: 'div' as const },
        color: '#666666',
        hoverColor: '#e1e1e1',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      icon: {
        name: 'LuFileText' as any,
        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
      },
      href: `/workspaces/${workspaceId}/templates/formulare`,
      overlayColor: '#0a4a7b',
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 'm' as const,
    },
    {
      title: {
        value: { value: { de: 'Galerien', en: 'Galleries' }, element: 'h3' as const },
        color: '#0a4a7b',
        hoverColor: '#ffffff',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      subtitle: {
        value: { value: { de: 'Bildergalerien und Slideshows', en: 'Image galleries and slideshows' }, element: 'div' as const },
        color: '#666666',
        hoverColor: '#e1e1e1',
        align: 'left' as const,
        transform: 'normal' as const,
      },
      icon: {
        name: 'LuImages' as any,
        small: { color: '#0a4a7b', hoverColor: '#ffffff' },
        large: { color: '#f0f3ff', hoverColor: '#327bb3' },
      },
      href: `/workspaces/${workspaceId}/templates/galerien`,
      overlayColor: '#0a4a7b',
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderRadius: 'm' as const,
    },
  ];

  return (
    <>
      <Breadcrumbs
        data={{
          layout: {
            outerWidth: 'full',
            innerWidth: 'xl',
            innerPaddingLeft: 'm',
            innerPaddingRight: 'm',
            innerPaddingTop: 'm',
            innerPaddingBottom: 'm',
          },
          links: [
            {
              label: { de: 'Dashboard', en: 'Dashboard' },
              href: {
                de: `/workspaces/${workspaceId}/dashboard`,
                en: `/workspaces/${workspaceId}/dashboard`,
              },
              highlighted: false,
            },
            {
              label: { de: 'Templates', en: 'Templates' },
              href: {
                de: `/workspaces/${workspaceId}/templates`,
                en: `/workspaces/${workspaceId}/templates`,
              },
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
            innerPaddingBottom: 'm',
          },
          children: (
            <>
              <Heading element="h1" value="Templates" />
              <div style={{ marginTop: '2rem' }}>
                <UnwrappedAnimatedCards
                  data={{
                    cards,
                    cardsPerRow: 4,
                    currentLanguage: 'de',
                  }}
                />
              </div>
            </>
          ),
        }}
      />
    </>
  );
}

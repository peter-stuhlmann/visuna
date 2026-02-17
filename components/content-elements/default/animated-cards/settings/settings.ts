export const settings = [
  {
    name: 'Inhalt',
    fields: [
      {
        name: 'Inhalt',
        fields: [
          {
            key: 'introContent',
            field: 'rte-textarea',
            title: 'Intro Content',
            default: '',
          },
          {
            key: 'stretchCards',
            field: 'switch',
            title: 'Stretch',
            default: true,
          },
          {
            key: 'cardsPerRow',
            field: 'number',
            title: 'Karten pro Reihe',
            default: '4',
          },
          {
            key: 'cards',
            field: 'animated-card[]',
            title: 'Cards',
            default: [
              {
                title: {
                  value: 'Test Titel',
                  color: '#0a4a7b',
                  hoverColor: '#ffffff',
                  align: 'left' as const,
                  transform: 'normal' as const,
                },
                subtitle: {
                  value: 'Subtitel Text',
                  color: '#666666',
                  hoverColor: '#e1e1e1',
                  align: 'left' as const,
                  transform: 'normal' as const,
                },
                icon: {
                  name: 'PiGearBold',
                  small: { color: '#0a4a7b', hoverColor: '#ffffff' },
                  large: { color: '#f0f3ff', hoverColor: '#327bb3' },
                },
                href: '',
                newTab: false,
                overlayColor: '#0a4a7b',
                backgroundColor: '#ffffff',
                borderColor: '#cccccc',
                borderRadius: 'l',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Stil',
    fields: [
      {
        name: 'Element-Layout',
        fields: [
          {
            key: 'layout',
            field: 'element-layout',
            title: 'Element Layout',
            default: {
              outerWidth: 'full',
              innerWidth: 'xl',
              outerPaddingTop: 'm',
              outerPaddingBottom: 'm',
              innerPaddingTop: 'm',
              innerPaddingBottom: 'm',
              innerPaddingLeft: 'm',
              innerPaddingRight: 'm',
              outerBackgroundColor: 'transparent',
              innerBackgroundColor: 'transparent',
              outerborderRadius: 'none',
              innerBorderRadius: 'none',
            },
          },
        ],
      },
    ],
  },
] as const;

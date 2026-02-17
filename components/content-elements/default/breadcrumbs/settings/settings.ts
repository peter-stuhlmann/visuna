export const settings = [
  {
    name: 'Inhalt',
    fields: [
      {
        name: 'Links',
        fields: [
          {
            key: 'links',
            field: 'link[]',
            title: 'Navigationslinks',
            default: [{ label: 'Startseite', href: '/home' }],
          },
        ],
      },
    ],
  },

  {
    name: 'Stil',
    fields: [
      {
        name: 'Farben',
        fields: [
          {
            key: 'backgroundColor',
            field: 'color[]',
            title: 'Hintergrundfarbe',
            default: 'transparent',
          },
          {
            key: 'dividerColor',
            field: 'color',
            title: 'Trennerfarbe',
            default: '#e5e7eb',
          }, // z.B. gray-200
          {
            key: 'highlightedTextColor',
            field: 'color',
            title: 'Highlighted Textfarbe',
            default: '#111827',
          }, // z.B. gray-900
          {
            key: 'textColor',
            field: 'color',
            title: 'Textfarbe (verlinkt)',
            default: '#374151',
          }, // z.B. gray-700
          {
            key: 'linkTextColor',
            field: 'color',
            title: 'Textfarbe (verlinkt)',
            default: '#374151',
          }, // z.B. gray-700
        ],
      },
      {
        name: 'Layout',
        fields: [
          {
            key: 'width',
            field: 'select',
            title: 'Außenbreite',
            default: 'full',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'innerWidth',
            field: 'select',
            title: 'Innenbreite',
            default: 'xl',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
        ],
      },
      {
        name: 'Eckenrundungen',
        fields: [
          {
            key: 'borderRadius',
            field: 'select',
            title: 'Äußere Rundung',
            default: 'none',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'innerBorderRadius',
            field: 'select',
            title: 'Innere Rundung',
            default: 'none',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
        ],
      },
      {
        name: 'Abstände',
        fields: [
          {
            key: 'marginTop',
            field: 'select',
            title: 'Außenabstand oben',
            default: 'none',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'marginBottom',
            field: 'select',
            title: 'Außenabstand unten',
            default: 'none',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'paddingTop',
            field: 'select',
            title: 'Innenabstand oben',
            default: 'm',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'paddingBottom',
            field: 'select',
            title: 'Innenabstand unten',
            default: 'm',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'paddingLeft',
            field: 'select',
            title: 'Innenabstand links',
            default: 'm',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
          {
            key: 'paddingRight',
            field: 'select',
            title: 'Innenabstand rechts',
            default: 'm',
            options: [
              {
                value: 's',
                label: 'Small',
              },
              {
                value: 'm',
                label: 'Medium',
              },
              {
                value: 'l',
                label: 'Large',
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

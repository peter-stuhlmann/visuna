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
            key: 'children',
            field: 'rte-textarea',
            title: 'Inhalt',
            default: '',
          },
          {
            key: 'ctaButton',
            field: 'link',
            title: 'CTA-Button',
            default: null,
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
            field: 'color',
            title: 'Hintergrundfarbe',
            default: 'transparent',
          },
          {
            key: 'innerBackgroundColor',
            field: 'color',
            title: 'Innere Hintegrundfarbe',
            default: 'transparent',
          },
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
              {
                value: 'xl',
                label: 'Extra Large',
              },
              {
                value: 'full',
                label: 'Full',
              },
            ],
          }, // z.B. 'full' | 'boxed'
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
              {
                value: 'xl',
                label: 'Extra Large',
              },
              {
                value: 'full',
                label: 'Full',
              },
            ],
          }, // z.B. 'md' | 'lg' | 'xl'
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

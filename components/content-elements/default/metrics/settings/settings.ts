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
            key: 'metrics',
            field: 'counter-item[]',
            title: 'Metriken',
            default: [],
            options: [
              { value: 'fast', label: 'Schnell (0,6s)' },
              { value: 'normal', label: 'Normal (1,2s)' },
              { value: 'slow', label: 'Langsam (2s)' },
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
        name: 'Farben',
        fields: [
          {
            key: 'backgroundColor',
            field: 'color',
            title: 'Hintergrundfarbe',
            default: 'transparent',
          },
          {
            key: 'headingColor',
            field: 'color',
            title: 'Überschriftfarbe',
            default: '#000000',
          },
          {
            key: 'textColor',
            field: 'color',
            title: 'Textfarbe',
            default: '#000000',
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

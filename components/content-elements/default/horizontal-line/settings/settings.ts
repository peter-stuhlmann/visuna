export const settings = [
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
            key: 'color',
            field: 'color',
            title: 'Linienfarbe',
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
              { value: 'full', label: 'Full' },
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
              { value: 'full', label: 'Full' },
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
        name: 'Abstände',
        fields: [
          {
            key: 'marginTop',
            field: 'select',
            title: 'Außenabstand oben',
            default: 'none',
            options: [
              { value: 'none', label: 'Kein Abstand' },
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
              { value: 'none', label: 'Kein Abstand' },
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
              { value: 'none', label: 'Kein Abstand' },
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
              { value: 'none', label: 'Kein Abstand' },
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
              { value: 'none', label: 'Kein Abstand' },
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
              { value: 'none', label: 'Kein Abstand' },
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

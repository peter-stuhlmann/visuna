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
            key: 'items',
            field: 'accordion-item[]', // oder 'array' / eigenes Widget
            title: 'Akkordeon-Items',
            default: [
              {
                id: 'item-1',
                title: 'Erstes Item',
                content: 'Inhalt des ersten Items',
              },
            ],
          },

          // z. B. 'chevron' | 'plus' | 'minus'
          {
            key: 'defaultIcon',
            field: 'select',
            title: 'Standard-Icon',
            default: 'chevron',
          },

          {
            key: 'allowMultiple',
            field: 'switch',
            title: 'Mehrere offen erlaubt',
            default: false,
          },
          {
            key: 'initialOpenIndex',
            field: 'number',
            title: 'Initial geöffnetes Item',
            default: 0,
          }, // -1 = alle zu
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
            key: 'headingTextColor',
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
          {
            key: 'defaultIconColor',
            field: 'color',
            title: 'Iconfarbe',
            default: '#000000',
          },
          {
            key: 'panelBackgroundColor',
            field: 'color',
            title: 'Panel-Hintergrund',
            default: '#ffffff',
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

export const settings = [
  {
    name: 'Inhalt',
    fields: [
      {
        name: 'Inhalt',
        fields: [
          { field: 'introContent', title: 'Intro Content', default: '' },

          {
            field: 'elementOverlineValue',
            title: 'Element-Overline',
            default: '',
          },
          {
            field: 'elementHeadingValue',
            title: 'Element-Überschrift',
            default: '',
          },
          {
            field: 'elementSublineValue',
            title: 'Element-Subline',
            default: '',
          },

          { field: 'image', title: 'Bild', default: null }, // je nach Typ ggf. {}
          { field: 'children', title: 'Inhalt (Rich Text)', default: '' }, // oder [] je nach Editor
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
            field: 'backgroundColor',
            title: 'Hintergrundfarbe',
            default: 'transparent',
          },
          {
            field: 'headingTextColor',
            title: 'Überschriftfarbe',
            default: '#000000',
          },
        ],
      },
      {
        name: 'Layout',
        fields: [
          { field: 'width', title: 'Außenbreite', default: 'full' },
          { field: 'innerWidth', title: 'Innenbreite', default: 'xl' },
        ],
      },
      {
        name: 'Eckenrundungen',
        fields: [
          { field: 'borderRadius', title: 'Äußere Rundung', default: 'none' },
          {
            field: 'innerBorderRadius',
            title: 'Innere Rundung',
            default: 'none',
          },
        ],
      },
      {
        name: 'Abstände',
        fields: [
          { field: 'marginTop', title: 'Außenabstand oben', default: 'none' },
          {
            field: 'marginBottom',
            title: 'Außenabstand unten',
            default: 'none',
          },
          { field: 'paddingTop', title: 'Innenabstand oben', default: 'm' },
          { field: 'paddingBottom', title: 'Innenabstand unten', default: 'm' },
          { field: 'paddingLeft', title: 'Innenabstand links', default: 'm' },
          { field: 'paddingRight', title: 'Innenabstand rechts', default: 'm' },
        ],
      },
    ],
  },
] as const;

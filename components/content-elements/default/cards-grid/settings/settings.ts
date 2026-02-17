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

          // TODO: aktuell nur text/color/select-size unterstützt.
          // Wenn ein eigener Cards-Renderer vorhanden ist, auf field: 'cards' ändern
          // und den Default unten wieder aktivieren.
          {
            key: 'cards',
            field: 'text',
            title: 'Karten (vorerst als Text)',
            default: '', // <- später wieder auf das Array setzen, wenn 'cards' unterstützt wird
            // default: [
            //   { id: 'card-1', title: 'Erste Karte', text: 'Kurzer Beschreibungstext.', href: '', image: null },
            //   { id: 'card-2', title: 'Zweite Karte', text: 'Noch ein kurzer Text.', href: '', image: null },
            // ],
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
            key: 'headingTextColor',
            field: 'color',
            title: 'Überschriftfarbe',
            default: '#000000',
          },
        ],
      },
      {
        name: 'Layout',
        fields: [
          {
            key: 'width',
            field: 'select-size',
            title: 'Außenbreite',
            default: 'full',
          },
          {
            key: 'innerWidth',
            field: 'select-size',
            title: 'Innenbreite',
            default: 'xl',
          },
        ],
      },
      {
        name: 'Eckenrundungen',
        fields: [
          {
            key: 'borderRadius',
            field: 'select-size',
            title: 'Äußere Rundung',
            default: 'none',
          },
          {
            key: 'innerBorderRadius',
            field: 'select-size',
            title: 'Innere Rundung',
            default: 'none',
          },
        ],
      },
      {
        name: 'Abstände',
        fields: [
          {
            key: 'marginTop',
            field: 'select-size',
            title: 'Außenabstand oben',
            default: 'none',
          },
          {
            key: 'marginBottom',
            field: 'select-size',
            title: 'Außenabstand unten',
            default: 'none',
          },
          {
            key: 'paddingTop',
            field: 'select-size',
            title: 'Innenabstand oben',
            default: 'm',
          },
          {
            key: 'paddingBottom',
            field: 'select-size',
            title: 'Innenabstand unten',
            default: 'm',
          },
          {
            key: 'paddingLeft',
            field: 'select-size',
            title: 'Innenabstand links',
            default: 'm',
          },
          {
            key: 'paddingRight',
            field: 'select-size',
            title: 'Innenabstand rechts',
            default: 'm',
          },
        ],
      },
    ],
  },
] as const;

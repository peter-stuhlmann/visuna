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
            key: 'elementIntroContent',
            field: 'rte-textarea',
            title: 'Element Intro Content',
            default: '',
          },
          'image',
          'children',
        ],
      },
    ],
  },
  {
    name: 'Stil',
    fields: [
      {
        name: 'Farben',
        fields: ['backgroundColor', 'headingTextColor'],
      },
      {
        name: 'Layout',
        fields: ['width', 'innerWidth'],
      },
      {
        name: 'Eckenrundungen',
        fields: ['borderRadius', 'innerBorderRadius'],
      },
      {
        name: 'Abstände',
        fields: [
          'marginTop',
          'marginBottom',
          'paddingTop',
          'paddingBottom',
          'paddingLeft',
          'paddingRight',
        ],
      },
    ],
  },
] as const;

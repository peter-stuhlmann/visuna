export const settings = [
  {
    name: 'Stil',
    fields: [
      {
        name: 'Größe',
        fields: [
          {
            key: 'size',
            field: 'select',
            title: 'Größe',
            default: 'm',
            options: [
              {
                label: 'Klein',
                value: 's',
              },
              {
                label: 'Mittel',
                value: 'm',
              },
              {
                label: 'Groß',
                value: 'l',
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

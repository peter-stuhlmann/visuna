export const settings = [
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
            config: {
              keys: ['outerPaddingTop', 'outerPaddingBottom'],
            },
            default: {
              outerWidth: 'full',
              innerWidth: 'full',
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

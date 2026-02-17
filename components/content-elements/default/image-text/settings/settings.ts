// settings.ts

import { DEFAULT_LAYOUT } from '../../core/wrapper/component/Wrapper.defaults';

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
            title: 'Content',
            default: '',
          },
          {
            key: 'image',
            field: 'image',
            title: 'Image',
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
        name: 'Element-Layout',
        fields: [
          {
            key: 'layout',
            field: 'element-layout',
            title: 'Element Layout',
            default: { ...DEFAULT_LAYOUT, outerBackgroundColor: '#0bd426ff' },
          },
        ],
      },
    ],
  },
] as const;

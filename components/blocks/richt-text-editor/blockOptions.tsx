import { SelectInputOption } from '@/components/content-elements/default/inputs/select-input/component/SelectInput.types';

export const blockOptions: SelectInputOption[] = [
  {
    value: 'paragraph',
    label: (
      <span style={{ fontSize: '1rem', fontWeight: 400 }}>Normaler Text</span>
    ),
    triggerLabel: 'P',
  },
  {
    value: 'h1',
    label: (
      <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>Überschrift 1</span>
    ),
    triggerLabel: 'H1',
  },
  {
    value: 'h2',
    label: (
      <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Überschrift 2</span>
    ),
    triggerLabel: 'H2',
  },
  {
    value: 'h3',
    label: (
      <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>
        Überschrift 3
      </span>
    ),
    triggerLabel: 'H3',
  },
  {
    value: 'h4',
    label: (
      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
        Überschrift 4
      </span>
    ),
    triggerLabel: 'H4',
  },
  {
    value: 'h5',
    label: (
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Überschrift 5</span>
    ),
    triggerLabel: 'H5',
  },
  {
    value: 'h6',
    label: (
      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
        Überschrift 6
      </span>
    ),
    triggerLabel: 'H6',
  },
];

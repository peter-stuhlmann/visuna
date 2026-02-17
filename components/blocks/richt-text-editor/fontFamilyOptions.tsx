import { SelectInputOption } from '@/components/content-elements/default/inputs/select-input/component/SelectInput.types';

export const fontFamilyOptions: SelectInputOption[] = [
  {
    value: '',
    label: <span style={{ fontFamily: 'inherit' }}>Standard</span>,
    triggerLabel: 'Standard',
  },
  {
    value: 'system-ui',
    label: <span style={{ fontFamily: 'system-ui' }}>System</span>,
    triggerLabel: 'System',
  },
  {
    value: "'Segoe UI', sans-serif",
    label: (
      <span style={{ fontFamily: "'Segoe UI', sans-serif" }}>Segoe UI</span>
    ),
    triggerLabel: 'Segoe UI',
  },
  {
    value: "'Arial', sans-serif",
    label: <span style={{ fontFamily: "'Arial', sans-serif" }}>Arial</span>,
    triggerLabel: 'Arial',
  },
  {
    value: "'Times New Roman', serif",
    label: (
      <span style={{ fontFamily: "'Times New Roman', serif" }}>
        Times New Roman
      </span>
    ),
    triggerLabel: 'Times New Roman',
  },
  {
    value: "'Georgia', serif",
    label: <span style={{ fontFamily: "'Georgia', serif" }}>Georgia</span>,
    triggerLabel: 'Georgia',
  },
  {
    value: "'Courier New', monospace",
    label: (
      <span style={{ fontFamily: "'Courier New', monospace" }}>
        Courier New
      </span>
    ),
    triggerLabel: 'Courier New',
  },
  {
    value: "'Comic Sans MS', cursive",
    label: (
      <span style={{ fontFamily: "'Comic Sans MS', cursive" }}>Comic Sans</span>
    ),
    triggerLabel: 'Comic Sans',
  },
];

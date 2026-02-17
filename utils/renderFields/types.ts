// types.ts

export type BaseFieldType =
  | 'text'
  | 'rte-text'
  | 'rte-textarea'
  | 'select'
  | 'radio'
  | 'color'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'number'
  | 'slider'
  | 'html'
  | 'link'
  | 'map'
  | 'image'
  | 'video'
  | 'audio'
  | 'accordion-item'
  | 'tabmenu-item'
  | 'counter-item'
  | 'animated-card'
  | 'list-item'
  | 'fact-item'
  | 'horizontal-line'
  | 'element-layout';

export type FieldOption = { label: string; value: string };

/**
 * "Array-Typen" werden als `${BaseFieldType}[]` notiert,
 * z.B. "text[]" oder "accordion-item[]".
 */
export type AnyFieldType = BaseFieldType | `${BaseFieldType}[]`;

/**
 * Das ist das Shape, das deine Inputs inzwischen liefern können.
 * (z.B. TextInputBlock: string | TranslatedValue)
 */
export type TranslatedValue = Record<string, string>;

/**
 * Props, die an die Feld-Renderer übergeben werden
 */
export type FieldRenderProps = {
  name?: string; // optional, Renderer muss fallbacken
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;

  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  placeholder?: string;

  /** Template für neue Items (z.B. aus settings.default[0]) */
  itemTemplate?: unknown;

  /** optional, falls du defaults reinreichen willst */
  defaultValue?: unknown;
  workspaceId?: string;
  config?: Record<string, unknown>;
};

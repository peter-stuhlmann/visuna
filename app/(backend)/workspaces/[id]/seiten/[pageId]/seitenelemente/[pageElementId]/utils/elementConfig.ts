import {
  FieldTypeMap,
  ElementTypeToDataMap,
} from '@/components/content-elements/default/types';

// Alle möglichen Keys aus allen konkreten Daten-Typen
type AllElementData = ElementTypeToDataMap[keyof ElementTypeToDataMap];

// Nur Keys, die auch im FieldTypeMap definiert sind
type CommonFieldKeys = Extract<keyof AllElementData, keyof FieldTypeMap>;

// Typen für Konfigurationsgruppen
type ConfigObject = Record<string, readonly CommonFieldKeys[]>;
type GroupedConfigs<T extends Record<string, ConfigObject>> = {
  [K in keyof T]: {
    [G in keyof T[K]]: readonly CommonFieldKeys[];
  };
};

// 🟢 Rohdaten – möglichst ohne "as const" Konflikte
const rawContentFieldConfigs = {
  'contact-map': {
    content: [
      'elementOverlineValue',
      'elementHeadingValue',
      'elementSublineValue',
      'children',
      'map',
      'address',
    ] as CommonFieldKeys[],
  },
  'intro-text': {
    content: [
      'overlineValue',
      'headingValue',
      'sublineValue',
      'children',
    ] as CommonFieldKeys[],
  },
  metrics: {
    content: [
      'overlineValue',
      'headingValue',
      'sublineValue',
    ] as CommonFieldKeys[],
  },
} as const;

const rawStyleFieldConfigs = {
  'contact-map': {
    colors: [
      'backgroundColor',
      'headingTextColor',
      'textColor',
    ] as CommonFieldKeys[],
    layout: ['width', 'innerWidth'] as CommonFieldKeys[],
    borderRadius: ['borderRadius', 'innerBorderRadius'] as CommonFieldKeys[],
    spacings: [
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
    ] as CommonFieldKeys[],
  },
  'intro-text': {
    colors: ['backgroundColor', 'headingTextColor'] as CommonFieldKeys[],
    layout: ['width', 'innerWidth'] as CommonFieldKeys[],
    borderRadius: ['borderRadius', 'innerBorderRadius'] as CommonFieldKeys[],
    spacings: [
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
    ] as CommonFieldKeys[],
  },
  metrics: {
    colors: ['backgroundColor', 'headingTextColor'] as CommonFieldKeys[],
    layout: ['width', 'innerWidth'] as CommonFieldKeys[],
    borderRadius: ['borderRadius', 'innerBorderRadius'] as CommonFieldKeys[],
    spacings: [
      'marginTop',
      'marginBottom',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
    ] as CommonFieldKeys[],
  },
  spacer: {
    layout: ['size'] as CommonFieldKeys[],
  },
} as const;

// ✅ Finaler Export mit Typprüfung
export const contentFieldConfigs: GroupedConfigs<
  typeof rawContentFieldConfigs
> = rawContentFieldConfigs;

export const styleFieldConfigs: GroupedConfigs<typeof rawStyleFieldConfigs> =
  rawStyleFieldConfigs;

import React from 'react';
import {
  PageElementData,
  FieldTypeMap,
  FieldComponentProps,
  AllElementData,
} from '@/components/content-elements/default/types';
import { fieldRegistry } from './fieldFactory';

// Extrahiere die Props jedes Feldes über FieldTypeMap
type RegistryComponentProps<K extends keyof FieldTypeMap> = FieldComponentProps<
  FieldTypeMap[K]
>;

// Eintrag, wie er im UI gerendert werden soll
type FieldEntry<K extends keyof FieldTypeMap> = {
  key: K;
  component: React.JSX.Element;
};

// Holt einen verschachtelten Wert aus einem Objekt (z. B. "boxSettings.marginTop")
function getNestedValue<T>(obj: T, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === 'object'
          ? (o as Record<string, unknown>)[k]
          : undefined,
      obj
    );
}

// Rendert ein einzelnes Feld aus dem Registry
function renderFieldForKey<K extends keyof FieldTypeMap>(
  key: K,
  data: AllElementData,
  onChange: (key: K, value: FieldTypeMap[K]) => void
): FieldEntry<K> | null {
  const componentFn = fieldRegistry[key];
  if (typeof componentFn !== 'function') return null;

  const rawValue = getNestedValue(data, key as string);
  const value = rawValue as FieldTypeMap[K];

  const props: RegistryComponentProps<K> = {
    name: String(key),
    value: value as FieldTypeMap[K],
    onChange: (val) => onChange(key, val),
  };

  return {
    key,
    component: componentFn(props),
  };
}

// Hauptfunktion, um Felder gruppiert zu definieren
export function defineGroupedFields<Data extends PageElementData>(
  groups: Record<string, readonly (keyof FieldTypeMap)[]>,
  data: Data,
  onChange: <K extends keyof FieldTypeMap>(
    key: K,
    value: FieldTypeMap[K]
  ) => void
) {
  return Object.entries(groups).map(([groupName, keys]) => {
    const fields = keys
      .map((key) => renderFieldForKey(key, data, onChange))
      .filter((f): f is FieldEntry<keyof FieldTypeMap> => !!f);

    return { groupName, fields };
  });
}

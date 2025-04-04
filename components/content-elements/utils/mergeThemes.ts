import { defaultTheme } from '@/components/content-elements/theme';
import type { Theme } from '../types';

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const k = key as keyof T;
      const sourceValue = source[k];
      if (sourceValue === undefined) continue;
      const targetValue = target[k];
      if (isObject(targetValue) && isObject(sourceValue)) {
        // Hier casten wir sourceValue, damit TypeScript weiß, dass es ein Partial des Zieltyps ist.
        output[k] = deepMerge(
          targetValue,
          sourceValue as Partial<typeof targetValue>
        );
      } else {
        // Hier casten wir sourceValue zum entsprechenden Typ.
        output[k] = sourceValue as T[typeof k];
      }
    }
  }
  return output;
}

const mergeThemes = (customTheme?: Theme): Theme => {
  return deepMerge(defaultTheme, customTheme ?? {});
};

export default mergeThemes;

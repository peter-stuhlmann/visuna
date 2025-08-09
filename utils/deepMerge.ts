export function deepMerge<T>(target: Partial<T>, source: Partial<T>): T {
  const result = { ...target } as Partial<T>;

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      isObject(sourceValue) &&
      isObject(targetValue) &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      // Rekursive Zuweisung mit Cast auf passende Teilstruktur
      (result as any)[key] = deepMerge(
        targetValue as Partial<any>,
        sourceValue as Partial<any>
      );
    } else {
      (result as any)[key] = sourceValue;
    }
  }

  return result as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

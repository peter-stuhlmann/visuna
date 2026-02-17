export function splitArrayType(type: string): {
  base: string;
  isArray: boolean;
} {
  const isArray = type.endsWith('[]');
  const base = isArray ? type.slice(0, -2) : type;
  return { base, isArray };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      // @ts-ignore
      return crypto.randomUUID();
    } catch {}
  }
  return `id_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const isPlainObject = (v: unknown) =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Nur fehlende Felder rekursiv auffüllen – referenziell stabil, wenn nichts ergänzt wird */
export function deepFillMissingNonMutating<T extends object>(
  target: T,
  defaults: Partial<T>
): T {
  let changed = false;

  function fill(t: any, d: any): any {
    if (!(d && typeof d === 'object') || Array.isArray(d)) return t;

    let out = t;

    for (const k of Object.keys(d)) {
      const dv = d[k];
      const tv = t?.[k];

      if (tv === undefined) {
        if (out === t) out = Array.isArray(t) ? [...t] : { ...t };
        out[k] =
          dv && typeof dv === 'object' && !Array.isArray(dv)
            ? fill({}, dv)
            : Array.isArray(dv)
            ? [...dv]
            : dv;
        changed = true;
      } else if (
        dv &&
        typeof dv === 'object' &&
        !Array.isArray(dv) &&
        tv &&
        typeof tv === 'object' &&
        !Array.isArray(tv)
      ) {
        const filledChild = fill(tv, dv);
        if (filledChild !== tv) {
          if (out === t) out = Array.isArray(t) ? [...t] : { ...t };
          out[k] = filledChild;
          changed = true;
        }
      }
    }
    return out;
  }

  const result = fill(target, defaults);
  return changed ? (result as T) : target;
}

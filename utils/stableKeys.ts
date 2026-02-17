// utils/stableKeys.ts
type MakeStableKeysOpts<T> = {
  /** Prefix für alle Keys (z. B. "bc" für Breadcrumbs) */
  prefix?: string;
  /** Eigene ID-Logik; wenn nicht vorhanden, werden gängige Felder probiert */
  getId?: (item: T) => string | undefined;
};

/** Keys in deterministischer Reihenfolge serialisieren */
function stableStringify(obj: unknown): string {
  const seen = new WeakSet();
  const stringify = (x: any): string => {
    if (x === null || typeof x !== 'object') return JSON.stringify(x);
    if (seen.has(x)) return '"[Circular]"';
    seen.add(x);

    if (Array.isArray(x)) {
      return `[${x.map(stringify).join(',')}]`;
    }
    const keys = Object.keys(x).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stringify(x[k])}`)
      .join(',')}}`;
  };
  return stringify(obj);
}

/** kleine Hashfunktion für kurze IDs */
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/** grobe Slugifizierung */
function toSlug(s: string): string {
  return s
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/\-+/g, '-')
    .replace(/^\-|\-$/g, '')
    .toLowerCase();
}

/**
 * Erzeugt pro Item einen stabilen, **eindeutigen** Key.
 * Bei Kollisionen wird automatisch "-1", "-2", ... angehängt.
 */
export function makeStableKeys<T>(
  items: T[] = [],
  opts: MakeStableKeysOpts<T> = {}
): string[] {
  const prefix = opts.prefix ? `${opts.prefix}-` : '';
  const counts = new Map<string, number>();

  return items.map((item) => {
    const candidateRaw =
      opts.getId?.(item) ||
      // verbreitete Felder:
      (item as any)?.id ||
      (item as any)?.key ||
      (item as any)?.href ||
      (item as any)?.label ||
      // fallback: stabiler Hash aus Inhalt
      `h${shortHash(stableStringify(item))}`;

    // Slug + als Fallback ein Hash, damit nie leer
    const base =
      toSlug(String(candidateRaw)) || `h${shortHash(stableStringify(item))}`;

    const used = counts.get(base) ?? 0;
    counts.set(base, used + 1);

    return used === 0 ? `${prefix}${base}` : `${prefix}${base}-${used}`;
  });
}

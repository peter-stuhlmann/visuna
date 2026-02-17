// utils/elementDefaults.ts
import type { AllElementData } from '@/components/content-elements/default/types';

const ELEMENT_BASE = '@/components/content-elements/default';

/** Nur index.ts im settings-Ordner darf defaults exportieren (named: `defaults`). */
export async function resolveElementDefaults(
  elementKey: string
): Promise<Partial<AllElementData>> {
  if (!elementKey) return {};
  try {
    const mod = (await import(
      /* webpackMode: "lazy" */
      /* webpackInclude: /default\/.*\/settings\/index\.(t|j)s$/ */
      `${ELEMENT_BASE}/${elementKey}/settings/index`
    )) as { defaults?: unknown };

    const raw = (mod as any)?.defaults;
    const val = typeof raw === 'function' ? (raw as Function)() : raw;

    return val && typeof val === 'object' && !Array.isArray(val)
      ? (val as Partial<AllElementData>)
      : {};
  } catch {
    // keine defaults.ts vorhanden oder kein index.ts → einfach leer zurück
    return {};
  }
}

/** Füllt nur fehlende Felder aus src in target (rekursiv), überschreibt NIE bestehende Werte. */
export function deepFillMissing<T extends Record<string, any>>(
  target: T,
  src: Partial<T>
): T {
  if (!src || typeof src !== 'object') return target;
  const out: any = Array.isArray(target) ? [...target] : { ...target };
  for (const [k, v] of Object.entries(src)) {
    const has = Object.prototype.hasOwnProperty.call(out, k);
    if (!has || out[k] === undefined || out[k] === null) {
      out[k] = Array.isArray(v)
        ? [...(v as any)]
        : v && typeof v === 'object'
        ? deepFillMissing({}, v as any)
        : v;
    } else if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepFillMissing(out[k], v as any);
    }
  }
  return out;
}

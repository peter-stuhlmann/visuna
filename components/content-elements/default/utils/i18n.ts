import { DEFAULT_LANGUAGES, LanguageCode } from '@/components/language-settings/languages';

/**
 * Zentraler Typ für lokalisierte Strings.
 * Unterstützt:
 * 1. Einfacher String (Legacy)
 * 2. Map: { de: "...", en: "..." }
 * 3. Verschachteltes Value-Element-Objekt: { value: { de: "..." }, element: "h1" }
 */
export type LocalizedString =
  | string
  | Record<string, string | undefined | null>
  | { value?: unknown; element?: unknown }
  | null
  | undefined;

/**
 * Type-Guard für Record<string, unknown>
 */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Type-Guard für LocalizedString Map (ohne value/element key)
 */
export function isLocalizedStringMap(v: unknown): v is Record<string, string | undefined | null> {
  if (!isRecord(v)) return false;
  // Wenn 'value' oder 'element' keys existieren, ist es das neue Format, keine reine Map
  if ('value' in v || 'element' in v) return false;
  return true;
}

/**
 * Löst einen LocalizedString für eine gegebene Sprache auf.
 * WICHTIG: KEIN Fallback auf 'de' oder andere Sprachen, wenn der Wert für 'lang' fehlt.
 * 
 * @param value Der zu lösende Wert (String, Map oder Object)
 * @param lang Der Sprachcode (z.B. 'de', 'en')
 * @returns Den übersetzten String oder '', wenn nichts gefunden wurde.
 */
export function resolveLocalizedText(value: LocalizedString, lang: string): string {
  if (value == null) return '';

  // 1) Einfacher String
  if (typeof value === 'string') return value;

  // 2) Neues Format: { value: ..., element: ... }
  // Wir rekursieren auf 'value', da dieses wiederum ein LocalizedString (meist Map) ist.
  if (isRecord(value) && 'value' in value) {
    return resolveLocalizedText((value as { value?: unknown }).value as LocalizedString, lang);
  }

  // 3) Map: { de: "...", en: "..." }
  if (isRecord(value)) {
    // Casten für Zugriff
    const obj = value as Record<string, unknown>;
    const byLang = obj[lang];

    if (typeof byLang === 'string' && byLang.trim()) {
      return byLang.trim();
    }
    
    // Explizit KEIN Fallback
    return '';
  }

  return '';
}

import contentElementsMetaData from '@/data/content-elements-metadata';

export type Language = 'de' | 'en';

type LabelsByLang = Record<Language, string>;
type ElementLabelMap = Record<string, LabelsByLang>;

/**
 * Map: elementKey -> { de, en }
 * elementKey ist: slug ohne führenden Slash
 * Beispiel: "/intro-text" -> "intro-text"
 */
export const ELEMENT_LABEL_MAP: ElementLabelMap = contentElementsMetaData
  .flatMap((group) => group.elements)
  .reduce<ElementLabelMap>((acc, el) => {
    const key = el.slug.startsWith('/') ? el.slug.slice(1) : el.slug;
    acc[key] = el.title;
    return acc;
  }, {});

export function getContentElementsName(
  elementKey: string,
  lang: Language
): string {
  return ELEMENT_LABEL_MAP[elementKey]?.[lang] ?? elementKey;
}

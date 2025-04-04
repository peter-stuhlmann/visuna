import { ContentElement } from '@/components/content-elements/types';
import contentElements from '@/data/content-elements';

export const getElement = async (
  slug: string | null
): Promise<ContentElement | null> => {
  try {
    if (!slug) return null;

    const allElements = contentElements.flatMap((item) => item.elements);
    const found = allElements.find((el) => {
      const elSlug = el?.slug ? String(el.slug) : null;
      if (!elSlug) return false;
      return elSlug.toLowerCase() === slug.toLowerCase();
    });

    if (!found) return null;

    return found as ContentElement;
  } catch (error) {
    console.error('Error fetching element:', error);
    return null;
  }
};

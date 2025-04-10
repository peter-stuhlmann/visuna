import { ElementProp } from '@/components/props-table/PropsTable.types';
import contentElements from '@/data/content-elements';
import { ReactNode } from 'react';

export type Translation = {
  [key: string]: string | ReactNode;
};

export type ContentElement = {
  name: Translation;
  description: Translation;
  slug: string;
  components?: ReactNode[];
  elementProps?: ElementProp[];
};

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

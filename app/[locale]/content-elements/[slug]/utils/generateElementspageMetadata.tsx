import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getElement } from './getContentElement';
import { ContentElementPageProps } from '../page';

export const generateElementMetadata = async ({
  params,
}: ContentElementPageProps): Promise<Metadata> => {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  const t = await getTranslations('Content');

  const element = await getElement(slug);

  if (!element) {
    return {
      title: t('elementNotFound'),
    };
  }

  return {
    title: `${element.name[locale]}`,
    description: `${t('elementPageMetaDescription')} "${
      element.name[locale]
    }".`,
  };
};

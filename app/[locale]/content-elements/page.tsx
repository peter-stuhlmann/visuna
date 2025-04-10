import type { Metadata } from 'next';
import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/content-elements/default/breadcrumbs/breadcrumbs';
import contentElementsSections, {
  ContentElementsSection,
} from '@/data/content-elements';
import ListItem from '@/components/content-elements-list-item/ListItem';
import List from '@/components/content-element-list/List';
import { Wrapper } from '@/components/content-elements/default';
import { ContentElement } from './[slug]/utils/getContentElement';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Content');
  return {
    title: `${t('contentElements')}`,
    description: t('contentElementsPageMetaDescription'),
  };
}

type ContentElementsPageProps = {
  params: Promise<{ locale: string }>;
};

const ContentElementsPage: FC<ContentElementsPageProps> = async ({
  params,
}) => {
  const t = await getTranslations('Content');
  const { locale } = await params;

  return (
    <main>
      <Breadcrumbs
        links={[
          { href: '/', label: t('home'), title: t('goToHome') },
          {
            href: null,
            label: t('contentElements'),
            title: t('goToContentElements'),
            isActive: true,
          },
        ]}
      />
      <Wrapper innerWidth="small" textAlign="center">
        <h1>{t('contentElements')}</h1>
        {contentElementsSections.map(
          (section: ContentElementsSection, idx: number) => (
            <section
              key={(section.name[locale] as string) + idx}
              style={{ margin: '0 0 4rem 0' }}
            >
              <h2>{section?.name[locale]}</h2>
              {section?.description?.[locale] && (
                <div>{section.description[locale]}</div>
              )}
              {section?.elements && (
                <List>
                  {section.elements.map(
                    (element: ContentElement, idx: number) => (
                      <ListItem
                        key={(element.name[locale] as string) + idx}
                        description={element.description[locale]}
                        name={element.name[locale] as string}
                        link={`/${locale}/content-elements/${element.slug}`}
                        linkText={t('goToPreview')}
                      />
                    )
                  )}
                </List>
              )}
            </section>
          )
        )}
      </Wrapper>
    </main>
  );
};

export default ContentElementsPage;

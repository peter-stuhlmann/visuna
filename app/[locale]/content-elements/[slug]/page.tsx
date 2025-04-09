import { FC, Fragment, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import WestIcon from '@mui/icons-material/West';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';
import { getElement } from './utils/getContentElement';
import { generateElementMetadata } from './utils/generateElementspageMetadata';
import IntroText from '@/components/content-elements/text/intro-text';
import { PRIMARY_COLOR } from '@/components/content-elements/content-elements.config';
import Spacer from '@/components/content-elements/layout/Spacer';
import PropsTable from '@/components/props-table';

export const generateMetadata = generateElementMetadata;

export type ContentElementPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

const ContentElementPage: FC<ContentElementPageProps> = async ({ params }) => {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  const element = await getElement(slug);

  if (!element) {
    notFound();
  }

  const t = await getTranslations('Content');

  return (
    <main>
      <Breadcrumbs
        links={[
          { href: '/', label: t('home'), title: t('goToHome') },
          {
            href: `/${locale}/content-elements`,
            label: t('contentElements'),
            title: t('goToContentElements'),
          },
          {
            href: null,
            label: element?.name[locale] as string,
            title: `${t('youAreHere')} ${element?.name[locale] as string}`,
            isActive: true,
          },
        ]}
      />
      <IntroText
        heading={element.name[locale]}
        headingType="h1"
        ctaButton={{
          children: (
            <>
              <WestIcon
                sx={{ marginTop: '-2px', marginRight: '0.5rem' }}
                aria-hidden="true"
              />
              {t('backToContentElementsList')}
            </>
          ),
          href: `/${locale}/content-elements`,
        }}
        align="center"
        textColor={PRIMARY_COLOR['950']}
        margin="none"
        padding="small"
      >
        {element.description[locale]}
      </IntroText>
      <Spacer $size="large" aria-hidden="true" />
      {element?.components?.map((component: ReactNode, idx: number) => (
        <Fragment key={idx}>{component}</Fragment>
      ))}
      {element?.elementProps && (
        <PropsTable contentElementProps={element.elementProps} />
      )}
    </main>
  );
};

export default ContentElementPage;

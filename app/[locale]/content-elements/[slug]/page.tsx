import { FC, Fragment, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import WestIcon from '@mui/icons-material/West';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/content-elements/default/breadcrumbs/breadcrumbs';
import { getElement } from './utils/getContentElement';
import { generateElementMetadata } from './utils/generateElementspageMetadata';
import PropsTable from '@/components/props-table';
import { IntroText } from '@/components/content-elements/default';
import Spacer from '@/components/content-elements/default/layout/spacer/component';

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

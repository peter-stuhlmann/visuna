import { FC, Fragment, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import WestIcon from '@mui/icons-material/West';
import Link from 'next/link';
import { Button } from '@mui/material';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';
import { getElement } from './utils/getContentElement';
import { generateElementMetadata } from './utils/generateElementspageMetadata';
import Wrapper from '@/components/wrapper';

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
      <Wrapper>
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
      </Wrapper>
      <Wrapper innerWidth="small" textAlign="center">
        <h1>{element.name[locale]}</h1>
        {element && element.description && element.description[locale] && (
          <div>{element.description[locale]}</div>
        )}
        <div>
          <Button
            component={Link}
            startIcon={
              <WestIcon sx={{ marginTop: '-2px' }} aria-hidden="true" />
            }
            href={`/${locale}/content-elements`}
            sx={{ color: '#133c59', fontWeight: 600 }}
          >
            {t('backToContentElementsList')}
          </Button>
        </div>
      </Wrapper>
      {element?.components?.map((component: ReactNode, idx: number) => (
        <Fragment key={idx}>{component}</Fragment>
      ))}
    </main>
  );
};

export default ContentElementPage;

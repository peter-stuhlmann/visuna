import { FC } from 'react';
import { getTranslations } from 'next-intl/server';
import { Heading, Wrapper } from '@/components/content-elements/default';

const NotFoundPage: FC = async () => {
  const t = await getTranslations('Content');

  return (
    <Wrapper
      data={{
        innerWidth: 'full',
        children: (
          <>
            <Heading element="h1" value={t('notFound')} />
            <p>{t('pageNotFound')}</p>
          </>
        ),
      }}
    />
  );
};

export default NotFoundPage;

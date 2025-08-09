import { FC } from 'react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Heading, Wrapper } from '@/components/content-elements/default';

const NotFoundPage: FC = async () => {
  const t = await getTranslations('Content');
  const locale = await getLocale();

  return (
    <main>
      <Wrapper
        data={{
          children: (
            <>
              <Heading element="h1" value={t('notFound')} />
              <p>{t('pageNotFound')}</p>
              <a href={`/${locale}`}>{t('goToHome')}</a>
            </>
          ),
          innerWidth: 'full',
        }}
      />
    </main>
  );
};

export default NotFoundPage;

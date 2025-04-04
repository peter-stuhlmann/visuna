import { FC } from 'react';
import { getTranslations, getLocale } from 'next-intl/server';

import Wrapper from '@/components/wrapper';

const NotFoundPage: FC = async () => {
  const t = await getTranslations('Content');
  const locale = await getLocale();

  return (
    <main>
      <Wrapper>
        <h1>{t('notFound')}</h1>
        <p>{t('pageNotFound')}</p>
        <a href={`http://localhost:3000/${locale}`}>{t('goToHome')}</a>
      </Wrapper>
    </main>
  );
};

export default NotFoundPage;

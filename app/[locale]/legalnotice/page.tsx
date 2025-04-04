import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/wrapper';
import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';

const LegalNoticePage: FC = async () => {
  const t = await getTranslations('Content');

  return (
    <main>
      <Wrapper>
        <Breadcrumbs
          links={[
            { href: '/', label: t('home'), title: t('goToHome') },
            {
              href: null,
              label: t('legalNotice'),
              title: t('legalNotice'),
              isActive: true,
            },
          ]}
        />
      </Wrapper>
      <Wrapper>
        <h1>{t('legalNotice')}</h1>
      </Wrapper>
    </main>
  );
};

export default LegalNoticePage;

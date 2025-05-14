import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { Breadcrumbs } from '@/components/content-elements/default';
import { IntroText } from '@/components/content-elements/default';

const LegalNoticePage: FC = async () => {
  const t = await getTranslations('Content');

  return (
    <main>
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
      <IntroText elementHeading={{ value: 'Legal notice' }}>
        Lorem ipsum
      </IntroText>
    </main>
  );
};

export default LegalNoticePage;

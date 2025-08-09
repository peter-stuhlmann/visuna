import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { Breadcrumbs, IntroText } from '@/components/content-elements/default';

const PrivacyPolicyPage: FC = async () => {
  const t = await getTranslations('Content');

  return (
    <main>
      <Breadcrumbs
        links={[
          { href: '/', label: t('home'), title: t('goToHome') },
          {
            href: null,
            label: t('privacyPolicy'),
            title: t('privacyPolicy'),
            isActive: true,
          },
        ]}
      />

      <IntroText
        data={{ headingValue: t('privacyPolicy'), children: 'Lorem ipsum' }}
      />
    </main>
  );
};

export default PrivacyPolicyPage;

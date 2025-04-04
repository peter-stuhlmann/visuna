import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/wrapper';
import Breadcrumbs from '@/components/content-elements/navigation/breadcrumbs';

const PrivacyPolicyPage: FC = async () => {
  const t = await getTranslations('Content');

  return (
    <main>
      <Wrapper>
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
      </Wrapper>
      <Wrapper>
        <h1>{t('privacyPolicy')}</h1>
      </Wrapper>
    </main>
  );
};

export default PrivacyPolicyPage;

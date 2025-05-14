import { FC } from 'react';

import { IntroText, SimpleHeader } from '@/components/content-elements/default';
import { Footer } from '@/components/content-elements/default';
import { getLocale } from 'next-intl/server';
import footerData from '@/data/footer-data';
import headerData from '@/data/header-data';
import { Locale } from '../layout';
import { getPrimaryColor } from '@/components/content-elements/default/constants';
import { getLocalizedFooter } from '@/components/content-elements/default/footer/footer/component/utils/getLocalizedFooter';
import { getLocalizedSimpleHeader } from '@/components/content-elements/default/header/simple-header/component/utils/getLocalizedSimpleHeader';

const HomePage: FC = async () => {
  const locale = await getLocale();
  const localizedFooter = getLocalizedFooter(footerData, locale as Locale);
  const localizedHeader = getLocalizedSimpleHeader(
    headerData,
    locale as Locale
  );

  return (
    <>
      <SimpleHeader data={localizedHeader} />
      <main>
        <IntroText
          elementHeading={{ value: 'Lorem ipsum', element: 'h1' }}
          ctaButton={{ children: 'Call-To-Action' }}
          textColor={getPrimaryColor()['950']}
        >
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. <b>Stet clita kasd gubergren</b>, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </p>
          <p>
            At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet. <b>Lorem ipsum dolor sit amet</b>, consetetur sadipscing
            elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
            magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet,
            consetetur sadipscing elitr, <b>sed diam nonumy eirmod</b> tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          </p>
        </IntroText>
      </main>
      <Footer data={localizedFooter} />
    </>
  );
};

export default HomePage;

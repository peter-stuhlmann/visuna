import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Locale } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';
import { Footer, SimpleHeader } from '@/components/content-elements/default';
import { getLocalizedFooter } from '@/components/content-elements/default/footer/footer/component/utils/getLocalizedFooter';
import { getLocalizedSimpleHeader } from '@/components/content-elements/default/header/simple-header/component/utils/getLocalizedSimpleHeader';
import footerData from './footer-data';
import headerData from './header-data';

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Overview over all Content Elements',
};

export default async function DemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const localizedFooter = getLocalizedFooter(footerData, locale as Locale);
  const localizedHeader = getLocalizedSimpleHeader(
    headerData,
    locale as Locale
  );

  return (
    <>
      <SimpleHeader data={localizedHeader} element="header" />
      {children}
      <Footer data={localizedFooter} element="footer" />
    </>
  );
}

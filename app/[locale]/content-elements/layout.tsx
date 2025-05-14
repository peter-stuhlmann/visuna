import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Locale } from '@/i18n/routing';
import { getLocale } from 'next-intl/server';
import { Footer } from '@/components/content-elements/default';
import { getLocalizedFooter } from '@/components/content-elements/default/footer/footer/component/utils/getLocalizedFooter';
import footerData from '@/data/footer-data';

export const metadata: Metadata = {
  title: 'ContentElements',
  description: 'Overview over all Content Elements',
};

export default async function ContentElementsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const localizedFooter = getLocalizedFooter(footerData, locale as Locale);

  return (
    <>
      {children}
      <Footer data={localizedFooter} />
    </>
  );
}

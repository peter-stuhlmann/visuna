import { primaryFont, secondaryFont, tertiaryFont } from '@/assets/fonts';
import CustomThemeProvider from '@/components/contexts/theme-context/ThemeContext';
import Footer from '@/components/footer';
import { getLocalizedFooter } from '@/components/footer/utils/getLocalizedFooter';
import { GlobalStyles } from '@/components/Global.styles';
import Header from '@/components/header';
import StyledComponentsRegistry from '@/components/StyledComponentsRegistry';
import footerData from '@/data/footer-data';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export type Locale = 'en' | 'de';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Content Elements',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const localizedFooter = getLocalizedFooter(footerData, locale as Locale);

  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      <NextIntlClientProvider messages={messages}>
        <CustomThemeProvider>
          <html lang={locale}>
            <body
              className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}`}
            >
              <div>
                <Header />
                {children}
              </div>
              <Footer data={localizedFooter} />
            </body>
          </html>
        </CustomThemeProvider>
      </NextIntlClientProvider>
    </StyledComponentsRegistry>
  );
}

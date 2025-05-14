import { primaryFont, secondaryFont, tertiaryFont } from '@/assets/fonts';
import { GlobalStyles } from '@/components/Global.styles';
import StyledComponentsRegistry from '@/components/StyledComponentsRegistry';
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

  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      <NextIntlClientProvider messages={messages}>
        <html lang={locale}>
          <body
            className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}`}
          >
            <div>{children}</div>
          </body>
        </html>
      </NextIntlClientProvider>
    </StyledComponentsRegistry>
  );
}

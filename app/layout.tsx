// app/layout.tsx
import React from 'react';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { primaryFont, secondaryFont, tertiaryFont } from '@/assets/fonts';
import { GlobalStyles } from '@/components/Global.styles';
import StyledComponentsRegistry from '@/components/StyledComponentsRegistry';
import { ViewTransitions } from 'next-view-transitions';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();

  const h = await headers();
  const htmlLang = h.get('x-html-lang') || 'de';

  return (
    <ViewTransitions>
      <html lang={htmlLang}>
        <body
          className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}`}
        >
          <StyledComponentsRegistry>
            <GlobalStyles />
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </StyledComponentsRegistry>
        </body>
      </html>
    </ViewTransitions>
  );
}

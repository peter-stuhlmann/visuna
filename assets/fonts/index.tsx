import { Nunito_Sans, Poppins, Ubuntu } from 'next/font/google';

export const primaryFont = Nunito_Sans({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--primary-font',
  display: 'swap',
});

export const secondaryFont = Ubuntu({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--secondary-font',
  display: 'swap',
});

export const tertiaryFont = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: '--tertiary-font',
  display: 'swap',
});

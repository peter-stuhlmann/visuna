import { Raleway, Poppins, Noto_Serif } from 'next/font/google';

export const primaryFont = Raleway({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--primary-font',
  display: 'swap',
});

export const secondaryFont = Noto_Serif({
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

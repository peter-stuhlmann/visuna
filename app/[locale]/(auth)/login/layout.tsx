import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Login | VISUNA',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Logs',
};

export default function LogsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

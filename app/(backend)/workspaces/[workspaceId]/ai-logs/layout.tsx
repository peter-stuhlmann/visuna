import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI-Logs',
};

export default function AiLogsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

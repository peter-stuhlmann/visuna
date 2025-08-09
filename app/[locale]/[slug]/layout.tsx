import { ReactNode } from 'react';

export default function FrontendLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

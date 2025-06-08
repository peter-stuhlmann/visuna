import AuthScreenLayout from '@/components/auth-screen-layout';
import { ReactNode } from 'react';

export default function AuthScreensLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthScreenLayout>{children}</AuthScreenLayout>;
}

import AuthScreenLayout from '@/components/auth-screen-layout';
import { Wrapper } from '@/components/content-elements/default';
import { ReactNode } from 'react';

export default async function AuthScreensLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AuthScreenLayout>
      <Wrapper data={{ innerWidth: 'm', children: children }} />
    </AuthScreenLayout>
  );
}

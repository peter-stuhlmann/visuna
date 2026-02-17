import AuthScreenLayout from '@/components/auth-screen-layout';
import { Wrapper } from '@/components/content-elements/default';
import { ReactNode } from 'react';

export default function AuthScreensLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthScreenLayout>
      <Wrapper
        data={{
          layout: {
            innerWidth: 'm',
            innerPaddingTop: 'm',
            innerPaddingRight: 'm',
            innerPaddingBottom: 'm',
            innerPaddingLeft: 'm',
          },
          children,
        }}
      />
    </AuthScreenLayout>
  );
}

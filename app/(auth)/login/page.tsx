// app/login/page.tsx
'use client';

import { FC, useState } from 'react';

import LoginForm from '@/components/forms/login';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';
import { useTransitionRouter } from 'next-view-transitions';
import { pageAnimation } from '@/utils/authPageAnimation';
import Spacer from '@/components/content-elements/default/spacer';
import SocialLoginButtons from '@/components/social-login-buttons/SocialLoginButtons';
import { Divider } from '@/components/social-login-buttons/SocialLoginButtons.styles';

const LoginPage: FC = () => {
  const router = useTransitionRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <>
      <Heading element="h1" value="Log in" />

      <Spacer data={{ size: 's' }} />

      <SocialLoginButtons
        onShowEmailForm={() => setShowEmailForm(true)}
        showEmailForm={showEmailForm}
        emailButtonLabel="Mit E-Mail anmelden"
      />

      {showEmailForm && (
        <>
          <Divider>
            <span>oder</span>
          </Divider>

          <LoginForm />

          <Spacer data={{ size: 's' }} />

          <Link
            href="/passwort-vergessen"
            onClick={(e) => {
              e.preventDefault();
              router.push('/passwort-vergessen', {
                onTransitionReady: pageAnimation,
              });
            }}
          >
            Passwort vergessen?
          </Link>
        </>
      )}

      <Spacer data={{ size: 's' }} />

      <p>
        Du hast noch keinen Account?{' '}
        <Link
          href="/registrierung"
          onClick={(e) => {
            e.preventDefault();
            router.push('/registrierung', { onTransitionReady: pageAnimation });
          }}
        >
          Zur Registrierung
        </Link>
      </p>
    </>
  );
};

export default LoginPage;

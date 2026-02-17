'use client';

import { FC, Suspense, useState } from 'react';

import RegisterForm from '@/components/forms/register';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';
import { useTransitionRouter } from 'next-view-transitions';
import { pageAnimation } from '@/utils/authPageAnimation';
import { AuthNote } from '@/components/auth-screen-layout/AuthScreenLayout.styles';
import Spacer from '@/components/content-elements/default/spacer';
import SocialLoginButtons from '@/components/social-login-buttons/SocialLoginButtons';
import { Divider } from '@/components/social-login-buttons/SocialLoginButtons.styles';

const RegisterPage: FC = () => {
  const router = useTransitionRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [isRegistrationSuccessful, setIsRegistrationSuccessful] =
    useState<boolean>(false);

  if (isRegistrationSuccessful) {
    return (
      <>
        <Heading element="h1" value="Überprüfe Dein E-Mail-Postfach" />

        <p>Überprüfe Dein E-Mail-Postfach und bestätige Deine Registrierung.</p>
        <p>
          Du hast Deine Registrierung bereits bestätigt?{' '}
          <Link href="/login">Zur Login-Seite</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <Heading element="h1" value="Account erstellen" />

      <Spacer data={{ size: 's' }} />

      <SocialLoginButtons
        onShowEmailForm={() => setShowEmailForm(true)}
        showEmailForm={showEmailForm}
        emailButtonLabel="Mit E-Mail registrieren"
      />

      {showEmailForm && (
        <>
          <Divider>
            <span>oder</span>
          </Divider>

          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm
              setIsRegistrationSuccessful={setIsRegistrationSuccessful}
            />
          </Suspense>
        </>
      )}

      <Spacer data={{ size: 's' }} />

      <p>
        Du hast bereits einen Account?{' '}
        <Link
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            router.push('/login', { onTransitionReady: pageAnimation });
          }}
        >
          Zur Login-Seite
        </Link>
      </p>

      <AuthNote>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
          et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </p>
      </AuthNote>
    </>
  );
};

export default RegisterPage;

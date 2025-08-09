'use client';

import { FC, Suspense, useState } from 'react';

import RegisterForm from '@/components/forms/register';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';

const RegisterPage: FC = () => {
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] =
    useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

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

      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm
          setIsRegistrationSuccessful={setIsRegistrationSuccessful}
          setStatusMessage={setStatusMessage}
        />
      </Suspense>
      {statusMessage && <div>{statusMessage}</div>}
      <p>
        Du hast bereits einen Account?{' '}
        <Link href="/login">Zur Login-Seite</Link>
      </p>
    </>
  );
};

export default RegisterPage;

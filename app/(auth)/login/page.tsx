'use client';

import { FC, useState } from 'react';

import LoginForm from '@/components/forms/login';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';

const LoginPage: FC = () => {
  const [statusMessage, setStatusMessage] = useState<string>('');

  return (
    <>
      <Heading element="h1" value="Log in" />

      <LoginForm setStatusMessage={setStatusMessage} />

      {statusMessage && <div>{statusMessage}</div>}

      <Link href="/passwort-vergessen">Passwort vergessen?</Link>

      <p>
        Du hast noch keinen Account?{' '}
        <Link href="/registrierung">Zur Registrierung</Link>
      </p>
    </>
  );
};

export default LoginPage;

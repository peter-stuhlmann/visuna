'use client';

import { FC, useState } from 'react';

import ResetPasswordForm from '@/components/forms/reset-password';
import Link from 'next/link';
import { Heading } from '@/components/content-elements/default';

const ResetPasswordPage: FC = () => {
  const [isPasswordResetSuccessful, setIsPasswordResetSuccessful] =
    useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  return (
    <>
      <Heading element="h1" value="Passwort zurücksetzen" />
      {!isPasswordResetSuccessful && (
        <ResetPasswordForm
          setIsPasswordResetSuccessful={setIsPasswordResetSuccessful}
          setStatusMessage={setStatusMessage}
        />
      )}
      {statusMessage && <div>{statusMessage}</div>}
      <Link href="/login">Zur Login-Seite</Link>
    </>
  );
};

export default ResetPasswordPage;

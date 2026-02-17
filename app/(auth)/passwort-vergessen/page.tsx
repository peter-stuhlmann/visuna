'use client';

import { FC, useState } from 'react';

import ResetPasswordForm from '@/components/forms/reset-password';
import Link from 'next/link';
import { Heading } from '@/components/content-elements/default';
import { useTransitionRouter } from 'next-view-transitions';
import { pageAnimation } from '@/utils/authPageAnimation';
import Spacer from '@/components/content-elements/default/spacer';

const ResetPasswordPage: FC = () => {
  const router = useTransitionRouter();

  const [isPasswordResetSuccessful, setIsPasswordResetSuccessful] =
    useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  return (
    <>
      <Heading element="h1" value="Passwort zurücksetzen" />

      <Spacer data={{ size: 's' }} />

      {!isPasswordResetSuccessful && (
        <ResetPasswordForm
          setIsPasswordResetSuccessful={setIsPasswordResetSuccessful}
          setStatusMessage={setStatusMessage}
        />
      )}

      <Spacer data={{ size: 's' }} />

      {statusMessage && <div>{statusMessage}</div>}
      <Link
        href="/login"
        onClick={(e) => {
          e.preventDefault();
          router.push('/login', {
            onTransitionReady: pageAnimation,
          });
        }}
      >
        Zur Login-Seite
      </Link>
    </>
  );
};

export default ResetPasswordPage;

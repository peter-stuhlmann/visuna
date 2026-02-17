'use client';

import { Button, TextInput } from '@/components/content-elements/default';
import Spacer from '@/components/content-elements/default/spacer';
import { FC, FormEvent, useState } from 'react';

type ResetPasswordFormProps = {
  setIsPasswordResetSuccessful: (isPasswordResetSuccessful: boolean) => void;
  setStatusMessage: (statusMessage: string) => void;
};

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  setIsPasswordResetSuccessful,
  setStatusMessage,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const responseData = await response.json();

    if (response.status === 200) {
      setIsPasswordResetSuccessful(true);
    }

    setStatusMessage(responseData.message);
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-start',
      }}
    >
      <TextInput
        id="email"
        label="E-Mail"
        name="email"
        type="email"
        required
        value={email}
        onChange={(value) => setEmail(value)}
        autoComplete="off"
      />

      <Spacer data={{ size: 's' }} />

      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Passwort zurücksetzen'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

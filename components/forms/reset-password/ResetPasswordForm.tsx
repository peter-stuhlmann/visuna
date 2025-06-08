'use client';

import { Button, TextInput } from '@/components/content-elements/default';
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
      }),
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
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <TextInput id="email" label="E-Mail" type="email" required />
      <Button type="submit" fullWidth variant="contained" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Passwort zurücksetzen'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

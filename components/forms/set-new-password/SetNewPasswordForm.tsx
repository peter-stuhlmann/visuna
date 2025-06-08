'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from '@/components/content-elements/default';

type SetNewPasswordFormProps = {
  code: string;
};

const SetNewPasswordForm: FC<SetNewPasswordFormProps> = ({ code }) => {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/auth/set-new-password', {
      method: 'POST',
      body: JSON.stringify({
        code: code,
        newPassword: formData.get('new-password'),
        newPasswordConfirm: formData.get('new-password-confirm'),
      }),
    });

    const responseData = await response.json();

    if (response.status === 200) {
      router.push('/login');
    }

    setStatusMessage(responseData.message);
    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <TextInput id="new-password" label="Neues Passwort" type="password" />
        </div>
        <div>
          <TextInput
            id="new-password-confirm"
            label="Passwort bestätigen"
            type="password"
          />
        </div>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Set new password'}
        </Button>
      </form>
      <div>{statusMessage}</div>
    </>
  );
};

export default SetNewPasswordForm;

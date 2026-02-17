'use client';

import { FC, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon, TextInput } from '@/components/content-elements/default';
import { ErrorMessage } from '@/components/Global.styles';
import Spacer from '@/components/content-elements/default/spacer';

type SetNewPasswordFormProps = {
  code: string;
};

const SetNewPasswordForm: FC<SetNewPasswordFormProps> = ({ code }) => {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] =
    useState<boolean>(false);

  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/auth/set-new-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        newPassword,
        newPasswordConfirm,
      }),
    });

    const responseData = await response.json();

    if (response.status === 200) {
      router.push('/login');
      return;
    }

    setStatusMessage(responseData.message);
    setIsLoading(false);
  };

  return (
    <>
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
          id="new-password"
          name="new-password"
          label="Neues Passwort"
          type={showPassword ? 'text' : 'password'}
          required
          value={newPassword}
          onChange={(value) => setNewPassword(value)}
          end={
            <button
              className="end"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'
              }
            >
              <Icon name={showPassword ? 'IoMdEyeOff' : 'IoMdEye'} size={24} />
            </button>
          }
        />

        <TextInput
          id="new-password-confirm"
          name="new-password-confirm"
          label="Passwort bestätigen"
          type={showPasswordConfirm ? 'text' : 'password'}
          required
          value={newPasswordConfirm}
          onChange={(value) => setNewPasswordConfirm(value)}
          end={
            <button
              className="end"
              type="button"
              onClick={() => setShowPasswordConfirm((v) => !v)}
              aria-label={
                showPasswordConfirm
                  ? 'Passwortbestätigung verbergen'
                  : 'Passwortbestätigung anzeigen'
              }
            >
              <Icon
                name={showPasswordConfirm ? 'IoMdEyeOff' : 'IoMdEye'}
                size={24}
              />
            </button>
          }
        />

        <Spacer data={{ size: 's' }} />

        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Neues Passwort setzen'}
        </Button>
      </form>

      <Spacer data={{ size: 's' }} />

      <ErrorMessage>{statusMessage}</ErrorMessage>
    </>
  );
};

export default SetNewPasswordForm;

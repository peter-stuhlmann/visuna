'use client';

import { FC, FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button, TextInput } from '@/components/content-elements/default';

type RegisterFormProps = {
  setIsRegistrationSuccessful: (success: boolean) => void;
  setStatusMessage: (statusMessage: string) => void;
};

const RegisterForm: FC<RegisterFormProps> = ({
  setIsRegistrationSuccessful,
  setStatusMessage,
}) => {
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get('user') || '';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [showPassword, setShowPassword] = useState<boolean>(false);
  const showPassword = false;

  // const handleClickShowPassword = () => setShowPassword((show) => !show);

  // const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  // };

  // const handleMouseUpPassword = (event: MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        passwordConfirm: formData.get('password-confirm'),
      }),
    });

    if (response.status === 200) {
      setIsRegistrationSuccessful(true);
    } else {
      const responseData = await response.json();
      setStatusMessage(responseData.message);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <TextInput
        id="email"
        name="email"
        label="E-Mail"
        type="email"
        required
        defaultValue={emailQuery}
      />

      <TextInput
        id="password"
        name="password"
        label="Passwort"
        type={showPassword ? 'text' : 'password'}
        required
      />

      <TextInput
        id="password-confirm"
        name="password-confirm"
        label="Passwort bestätigen"
        type={showPassword ? 'text' : 'password'}
        required
      />

      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Registrieren'}
      </Button>
    </form>
  );
};

export default RegisterForm;

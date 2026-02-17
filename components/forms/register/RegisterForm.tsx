'use client';

import { FC, FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button, Icon, TextInput } from '@/components/content-elements/default';
import Spacer from '@/components/content-elements/default/spacer';
import { ErrorMessage } from '@/components/Global.styles';

type RegisterFormProps = {
  setIsRegistrationSuccessful: (success: boolean) => void;
};

const RegisterForm: FC<RegisterFormProps> = ({
  setIsRegistrationSuccessful,
}) => {
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get('user') || '';

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] =
    useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Prefill aus Query, aber nur wenn noch nichts getippt wurde
  useEffect(() => {
    if (!email && emailQuery) setEmail(emailQuery);
  }, [emailQuery, email]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        passwordConfirm,
      }),
    });

    if (response.status === 200) {
      setIsRegistrationSuccessful(true);
      return;
    }

    const responseData = await response.json();
    setErrorMessage(responseData.message);
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
          id="email"
          name="email"
          label="E-Mail"
          type="email"
          required
          value={email}
          onChange={(value) => setEmail(value)}
          autoComplete="off"
        />

        <TextInput
          id="password"
          name="password"
          label="Passwort"
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(value) => setPassword(value)}
          end={
            <button
              className="end"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? 'IoMdEyeOff' : 'IoMdEye'} size={24} />
            </button>
          }
        />

        <TextInput
          id="password-confirm"
          name="password-confirm"
          label="Passwort bestätigen"
          type={showPasswordConfirm ? 'text' : 'password'}
          required
          value={passwordConfirm}
          onChange={(value) => setPasswordConfirm(value)}
          end={
            <button
              className="end"
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
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
          {isLoading ? 'Loading...' : 'Registrieren'}
        </Button>
      </form>

      <Spacer data={{ size: 's' }} />

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </>
  );
};

export default RegisterForm;

'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FC, FormEvent, useState } from 'react';

import { Button, TextInput } from '@/components/content-elements/default';

type LoginFormProps = {
  setStatusMessage: (statusMessage: string) => void;
};

const LoginForm: FC<LoginFormProps> = ({ setStatusMessage }) => {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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

    const response = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    });

    if (response?.error) {
      setStatusMessage('Das eingegebene Passwort ist nicht korrekt.');
      setIsLoading(false);
    }

    if (!response?.error) {
      router.push(`/dashboard`);
      router.refresh();
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
        label="E-Mail"
        name="email"
        required
        value={email}
        type={'email'}
        onChange={(value) => setEmail(value)}
        autoFocus
      />

      <TextInput
        id="password"
        label="Passwort"
        name="password"
        value={password}
        required
        type={showPassword ? 'text' : 'password'}
        onChange={(value) => setPassword(value)}
      />

      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Log in'}
      </Button>
    </form>
  );
};

export default LoginForm;

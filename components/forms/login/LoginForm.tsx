'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, FormEvent, useMemo, useState } from 'react';

import { Button, Icon, TextInput } from '@/components/content-elements/default';
import Spacer from '@/components/content-elements/default/spacer';
import { ErrorMessage } from '@/components/Global.styles';

const LoginForm: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Optional: wenn du später ?callbackUrl=... nutzen willst
  const callbackUrl = useMemo(() => {
    const cb = (searchParams.get('callbackUrl') || '').trim();
    // Sicherheitsnetz: nur interne Ziele erlauben
    if (!cb || !cb.startsWith('/')) return '/workspaces';
    return cb;
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setErrorMessage('E-Mail oder Passwort ist nicht korrekt.');
        setIsLoading(false);
        return;
      }

      // ✅ Nach Login: Session ist da -> Server-Route /workspaces entscheidet weiter
      router.replace(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error('[LoginForm] signIn error:', err);
      setErrorMessage('Login fehlgeschlagen. Bitte versuche es erneut.');
      setIsLoading(false);
    }
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
          label="E-Mail"
          name="email"
          required
          value={email}
          type="email"
          onChange={(value) => setEmail(value)}
          autoFocus
          autoComplete="off"
        />

        <TextInput
          id="password"
          label="Passwort"
          name="password"
          value={password}
          type={showPassword ? 'text' : 'password'}
          required
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

        <Spacer data={{ size: 's' }} />

        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Log in'}
        </Button>
      </form>

      <Spacer data={{ size: 's' }} />

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </>
  );
};

export default LoginForm;

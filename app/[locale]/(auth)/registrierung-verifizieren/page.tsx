import { FC } from 'react';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { Heading } from '@/components/content-elements/default';
import Link from 'next/link';

type VerifyPageProps = {
  searchParams?: Promise<{ code?: string }>;
};

const VerifyPage: FC<VerifyPageProps> = async ({ searchParams }) => {
  const resolvedSearchParams = searchParams
    ? await searchParams
    : { code: undefined };
  const code = resolvedSearchParams.code || null;

  const verificationStatus = await getVerificationStatus(code);

  if (verificationStatus === 200) {
    redirect('/login');
  }

  return (
    <>
      <Heading element="h1" value="Bestätige Deine Registrierung" />

      <div>{verificationStatus?.message}</div>

      <p>
        Du hast Deine Registrierung bereits bestätigt?{' '}
        <Link href="/login">Zur Login-Seite</Link>
      </p>
    </>
  );
};

export default VerifyPage;

const getVerificationStatus = async (code: string | null) => {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code }),
      }
    );

    const data = await response.json();

    if (response.status === 200) {
      return 200;
    } else {
      return data;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
};
